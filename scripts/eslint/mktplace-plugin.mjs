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
    'no-next-head-import': {
      meta: {
        type: 'problem',
        docs: { description: 'Use the App Router metadata API instead of next/head.' },
        schema: [],
        messages: { useMetadata: 'Do not import next/head in the App Router; use the metadata API.' },
      },
      create(context) {
        function check(source, node) {
          if (source?.value === 'next/head') context.report({ node, messageId: 'useMetadata' });
        }
        return {
          ImportDeclaration(node) { check(node.source, node); },
          ExportAllDeclaration(node) { check(node.source, node); },
          ExportNamedDeclaration(node) { check(node.source, node); },
          ImportExpression(node) { check(node.source, node); },
          CallExpression(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'require') check(node.arguments[0], node);
          },
        };
      },
    },
    'no-next-document-import': {
      meta: {
        type: 'problem',
        docs: { description: 'Prevent next/document imports in application modules.' },
        schema: [],
        messages: { noDocument: 'Do not import next/document in application modules.' },
      },
      create(context) {
        function check(source, node) {
          if (source?.value === 'next/document') context.report({ node, messageId: 'noDocument' });
        }
        return {
          ImportDeclaration(node) { check(node.source, node); },
          ExportAllDeclaration(node) { check(node.source, node); },
          ExportNamedDeclaration(node) { check(node.source, node); },
          ImportExpression(node) { check(node.source, node); },
          CallExpression(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'require') check(node.arguments[0], node);
          },
        };
      },
    },
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
    'no-server-only-imports-in-client': {
      meta: {
        type: 'problem',
        docs: { description: 'Block server-only modules from client components.' },
        schema: [],
        messages: { serverImport: 'Client components cannot import server-only modules or Node.js built-ins.' },
      },
      create(context) {
        if (!hasUseClientDirective(context.sourceCode)) return {};
        const filename = context.filename ?? context.getFilename();
        function check(source, node) {
          if (typeof source?.value === 'string' && isProtectedImport(source.value, filename)) {
            context.report({ node, messageId: 'serverImport' });
          }
        }
        return {
          ImportDeclaration(node) { check(node.source, node); },
          ExportAllDeclaration(node) { check(node.source, node); },
          ExportNamedDeclaration(node) { check(node.source, node); },
          ImportExpression(node) { check(node.source, node); },
          CallExpression(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'require') check(node.arguments[0], node);
          },
        };
      },
    },
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
            if (!chain?.includes('process')) return;
            if (node.parent?.type === 'MemberExpression' && node.parent.object === node && memberPath(node.parent)?.includes('process')) return;
            const processIndex = chain.lastIndexOf('process');
            const key = chain[processIndex + 2];
            const safe = chain[processIndex + 1] === 'env'
              && chain.length === processIndex + 3
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
