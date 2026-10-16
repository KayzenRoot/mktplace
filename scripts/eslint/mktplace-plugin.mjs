import { builtinModules } from 'node:module';
import path from 'node:path';

const nodeBuiltins = new Set(builtinModules.map((name) => name.replace(/^node:/, '')));
const protectedLibraryPath = /^(?:src\/)?lib\/(?:bling|db|security|demo-guard)(?:\/|$)/;
const serverOnlyNextModules = ['next/headers', 'next/server', 'next/cache', 'next/og'];

function staticPropertyName(node) {
  if (!node?.computed && node?.property?.type === 'Identifier') return node.property.name;
  if (node?.computed && node?.property?.type === 'Literal' && typeof node.property.value === 'string') return node.property.value;
  return undefined;
}

function memberPath(node) {
  const properties = [];
  let current = node;
  while (current?.type === 'MemberExpression') {
    properties.unshift(staticPropertyName(current));
    current = current.object;
  }
  if (current?.type !== 'Identifier') return undefined;
  properties.unshift(current.name);
  return properties;
}

function memberRoot(node) {
  let current = node;
  while (current?.type === 'MemberExpression') current = current.object;
  if (current?.type === 'ChainExpression') return memberRoot(current.expression);
  return current;
}

function findVariable(identifier, context) {
  let scope = context.sourceCode.getScope(identifier);
  while (scope) {
    const variable = scope.set.get(identifier.name);
    if (variable) return variable;
    scope = scope.upper;
  }
  return undefined;
}

function isGlobalIdentifier(identifier, name, context) {
  if (identifier?.type !== 'Identifier' || identifier.name !== name) return false;
  const variable = findVariable(identifier, context);
  return !variable || variable.defs.length === 0;
}

function isGlobalProcessExpression(node, context, aliases = new Set()) {
  if (node?.type === 'ChainExpression') return isGlobalProcessExpression(node.expression, context, aliases);
  if (node?.type === 'Identifier') {
    if (isGlobalIdentifier(node, 'process', context)) return true;
    const variable = findVariable(node, context);
    if (!variable || variable.defs.length !== 1 || aliases.has(variable)) return false;
    const definition = variable.defs[0];
    if (definition.type !== 'Variable' || definition.parent?.kind !== 'const' || !definition.node.init) return false;
    const nextAliases = new Set(aliases);
    nextAliases.add(variable);
    return isGlobalProcessExpression(definition.node.init, context, nextAliases);
  }
  const chain = memberPath(node);
  return chain?.length === 2
    && chain[0] === 'globalThis'
    && chain[1] === 'process'
    && isGlobalIdentifier(node.object, 'globalThis', context);
}

function hasUseClientDirective(sourceCode) {
  for (const statement of sourceCode.ast.body) {
    if (statement.type !== 'ExpressionStatement' || typeof statement.directive !== 'string') return false;
    if (statement.directive === 'use client') return true;
  }
  return false;
}

function isProtectedImport(specifier, filename) {
  const normalized = specifier.replaceAll('\\', '/');
  if (normalized === 'server-only' || normalized === 'pg') return true;
  if (serverOnlyNextModules.some((moduleName) => normalized === moduleName || normalized.startsWith(`${moduleName}/`))) return true;
  if (normalized === '@/auth') return true;

  const packageRoot = normalized.replace(/^node:/, '').split('/')[0];
  if (normalized.startsWith('node:') || nodeBuiltins.has(packageRoot)) return true;

  let target;
  if (normalized.startsWith('@/')) target = path.resolve(process.cwd(), 'src', normalized.slice(2));
  else if (normalized.startsWith('.')) target = path.resolve(path.dirname(filename), normalized);
  else return false;

  const relative = path.relative(process.cwd(), target).replaceAll('\\', '/');
  return ['auth', 'auth.ts', 'auth.tsx'].includes(relative) || protectedLibraryPath.test(relative);
}

function literalString(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0]?.value?.cooked;
  if (node?.type === 'JSXExpressionContainer') return literalString(node.expression);
  return undefined;
}

function createImportVisitors(check) {
  return {
    ImportDeclaration(node) { check(node.source, node); },
    ExportAllDeclaration(node) { check(node.source, node); },
    ExportNamedDeclaration(node) { check(node.source, node); },
    ImportExpression(node) { check(node.source, node); },
    CallExpression(node) {
      if (node.callee.type === 'Identifier' && node.callee.name === 'require') check(node.arguments[0], node);
    },
  };
}

function createImportRule({ description, messageId, message, matches, appliesTo = () => true }) {
  return {
    meta: {
      type: 'problem',
      docs: { description },
      schema: [],
      messages: { [messageId]: message },
    },
    create(context) {
      if (!appliesTo(context)) return {};
      return createImportVisitors((source, node) => {
        if (matches(source?.value, context)) context.report({ node, messageId });
      });
    },
  };
}

const plugin = {
  meta: { name: '@mktplace/eslint-plugin' },
  rules: {
    'no-html-image': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Use next/image for app image rendering.' },
        schema: [],
        messages: { useImage: 'Use next/image Image instead of a raw img element.' },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (node.name.type === 'JSXIdentifier' && node.name.name === 'img') {
              context.report({ node, messageId: 'useImage' });
            }
          },
        };
      },
    },
    'require-next-link': {
      meta: {
        type: 'problem',
        docs: { description: 'Use next/link for internal route links.' },
        schema: [],
        messages: { useLink: 'Use next/link Link for internal application routes.' },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'a') return;
            const href = node.attributes.find((attribute) =>
              attribute.type === 'JSXAttribute' && attribute.name.name === 'href');
            const value = literalString(href?.value);
            if (value?.startsWith('/') && !value.startsWith('//')) {
              context.report({ node, messageId: 'useLink' });
            }
          },
        };
      },
    },
    'no-next-head-import': createImportRule({
      description: 'Use the App Router metadata API instead of next/head.',
      messageId: 'useMetadata',
      message: 'Do not import next/head in the App Router; use the metadata API.',
      matches: (source) => source === 'next/head',
    }),
    'no-next-document-import': createImportRule({
      description: 'Prevent next/document imports in application modules.',
      messageId: 'noDocument',
      message: 'Do not import next/document in application modules.',
      matches: (source) => source === 'next/document',
    }),
    'no-html-head': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Use App Router metadata instead of a raw head element.' },
        schema: [],
        messages: { useMetadata: 'Use the App Router metadata API instead of a raw head element.' },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (node.name.type === 'JSXIdentifier' && node.name.name === 'head') {
              context.report({ node, messageId: 'useMetadata' });
            }
          },
        };
      },
    },
    'no-sync-script': {
      meta: {
        type: 'problem',
        docs: { description: 'Use next/script instead of a raw script element.' },
        schema: [],
        messages: { useScript: 'Use next/script Script instead of a raw script element.' },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (node.name.type === 'JSXIdentifier' && node.name.name === 'script') {
              context.report({ node, messageId: 'useScript' });
            }
          },
        };
      },
    },
    'no-inline-script-id': {
      meta: {
        type: 'problem',
        docs: { description: 'Require an id on next/script components with inline content.' },
        schema: [],
        messages: { scriptId: '`next/script` components with inline content must specify an `id` attribute.' },
      },
      create(context) {
        let nextScriptImportName;
        return {
          ImportDeclaration(node) {
            if (node.source.value !== 'next/script') return;
            const defaultSpecifier = node.specifiers.find((specifier) => specifier.type === 'ImportDefaultSpecifier');
            if (defaultSpecifier) nextScriptImportName = defaultSpecifier.local.name;
          },
          JSXElement(node) {
            if (node.openingElement.name.type !== 'JSXIdentifier'
              || node.openingElement.name.name !== nextScriptImportName) return;

            const attributeNames = new Set();
            let hasUnknownSpread = false;
            for (const attribute of node.openingElement.attributes) {
              if (attribute.type === 'JSXAttribute') {
                if (attribute.name.type === 'JSXIdentifier') attributeNames.add(attribute.name.name);
                continue;
              }

              const properties = attribute.argument?.type === 'ObjectExpression'
                ? attribute.argument.properties
                : undefined;
              if (!properties) {
                hasUnknownSpread = true;
                break;
              }
              for (const property of properties) {
                if (property.type !== 'Property' || property.computed) {
                  hasUnknownSpread = true;
                  break;
                }
                const name = property.key.type === 'Identifier' ? property.key.name : property.key.value;
                if (typeof name === 'string') attributeNames.add(name);
              }
              if (hasUnknownSpread) break;
            }

            if (hasUnknownSpread) return;
            const hasInlineContent = node.children.length > 0 || attributeNames.has('dangerouslySetInnerHTML');
            if (hasInlineContent && !attributeNames.has('id')) {
              context.report({ node, messageId: 'scriptId' });
            }
          },
        };
      },
    },
    'no-async-client-component': {
      meta: {
        type: 'problem',
        docs: { description: 'Keep client components synchronous.' },
        schema: [],
        messages: { syncClient: 'Client components must be synchronous; move async work to a server component or effect.' },
      },
      create(context) {
        if (!hasUseClientDirective(context.sourceCode)) return {};
        function check(node, name) {
          if (node?.async && typeof name === 'string' && /^[A-Z]/.test(name)) {
            context.report({ node, messageId: 'syncClient' });
          }
        }
        return {
          FunctionDeclaration(node) { check(node, node.id?.name); },
          VariableDeclarator(node) {
            const name = node.id.type === 'Identifier' ? node.id.name : undefined;
            check(node.init, name);
          },
          ExportDefaultDeclaration(node) {
            if (node.declaration.type === 'FunctionDeclaration' && !node.declaration.id) check(node.declaration, 'DefaultComponent');
            else if (node.declaration.type === 'ArrowFunctionExpression' || node.declaration.type === 'FunctionExpression') {
              check(node.declaration, 'DefaultComponent');
            }
          },
        };
      },
    },
    'no-server-only-imports-in-client': createImportRule({
      description: 'Block server-only modules from client components.',
      messageId: 'serverImport',
      message: 'Client components cannot import server-only modules or Node.js built-ins.',
      appliesTo: (context) => hasUseClientDirective(context.sourceCode),
      matches: (source, context) => typeof source === 'string'
        && isProtectedImport(source, context.filename ?? context.getFilename()),
    }),
    'no-server-env-in-client': {
      meta: {
        type: 'problem',
        docs: { description: 'Prevent server environment access in client components.' },
        schema: [],
        messages: { privateEnv: 'Client components may only read NEXT_PUBLIC_* variables or NODE_ENV.' },
      },
      create(context) {
        if (!hasUseClientDirective(context.sourceCode)) return {};
        return {
          MemberExpression(node) {
            const chain = memberPath(node);
            const processIndex = chain?.lastIndexOf('process') ?? -1;
            const processAlias = processIndex === -1 && isGlobalProcessExpression(memberRoot(node), context);
            if (processIndex === -1 && !processAlias) return;
            if (node.parent?.type === 'MemberExpression' && node.parent.object === node
              && (memberPath(node.parent)?.includes('process')
                || isGlobalProcessExpression(memberRoot(node.parent), context))) return;
            const processRootIndex = processIndex === -1 ? 0 : processIndex;
            const key = chain[processRootIndex + 2];
            const safe = chain[processRootIndex + 1] === 'env'
              && chain.length === processRootIndex + 3
              && (key === 'NODE_ENV' || (typeof key === 'string' && key.startsWith('NEXT_PUBLIC_')));
            if (!safe) context.report({ node, messageId: 'privateEnv' });
          },
          Identifier(node) {
            if (node.name === 'process' && !(node.parent?.type === 'MemberExpression' && node.parent.object === node)) {
              context.report({ node, messageId: 'privateEnv' });
            }
          },
        };
      },
    },
  },
};

export default plugin;
