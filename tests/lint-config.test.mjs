import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint({ cwd: process.cwd() });
const fixtureFile = path.join(process.cwd(), 'app', '__lint_fixture__.tsx');

async function ruleMessages(source) {
  const [result] = await eslint.lintText(source, { filePath: fixtureFile });
  return result.messages;
}

async function ruleIds(source) {
  return (await ruleMessages(source)).map(({ ruleId }) => ruleId).filter(Boolean);
}

function severity(config, ruleId) {
  const configured = config.rules[ruleId];
  return Array.isArray(configured) ? configured[0] : configured;
}

test('retains baseline React, Hooks, TypeScript and JSX accessibility severities', async () => {
  const config = await eslint.calculateConfigForFile(fixtureFile);
  const tsConfig = await eslint.calculateConfigForFile(path.join(process.cwd(), 'src', 'lib', 'bling', 'transport.ts'));
  assert.equal(severity(config, 'react/jsx-key'), 2);
  assert.equal(severity(config, 'react/prop-types'), 0);
  const hooksBaseline = {
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 1,
    'react-hooks/static-components': 2,
    'react-hooks/use-memo': 2,
    'react-hooks/preserve-manual-memoization': 2,
    'react-hooks/incompatible-library': 1,
    'react-hooks/immutability': 2,
    'react-hooks/globals': 2,
    'react-hooks/refs': 2,
    'react-hooks/set-state-in-effect': 2,
    'react-hooks/error-boundaries': 2,
    'react-hooks/purity': 2,
    'react-hooks/set-state-in-render': 2,
    'react-hooks/unsupported-syntax': 1,
    'react-hooks/config': 2,
    'react-hooks/gating': 2,
  };
  for (const [ruleId, expected] of Object.entries(hooksBaseline)) assert.equal(severity(config, ruleId), expected, ruleId);
  assert.equal(severity(config, '@typescript-eslint/no-explicit-any'), 2);
  assert.equal(severity(config, '@typescript-eslint/no-unused-vars'), 1);
  assert.equal(severity(tsConfig, '@typescript-eslint/no-unused-vars'), 1);
  assert.equal(severity(tsConfig, '@typescript-eslint/no-unused-expressions'), 1);
  assert.equal(severity(config, 'jsx-a11y/alt-text'), 1);
  assert.equal(severity(config, 'jsx-a11y/aria-props'), 1);
  assert.equal(severity(config, 'jsx-a11y/aria-proptypes'), 1);
  assert.equal(severity(config, 'jsx-a11y/aria-unsupported-elements'), 1);
  assert.equal(severity(config, 'jsx-a11y/role-has-required-aria-props'), 1);
  assert.equal(severity(config, 'jsx-a11y/role-supports-aria-props'), 1);
  assert.equal(severity(config, 'mktplace/no-html-image'), 1);
  assert.equal(severity(config, 'mktplace/require-next-link'), 2);
  assert.equal(severity(config, 'mktplace/no-next-head-import'), 2);
  assert.equal(severity(config, 'mktplace/no-next-document-import'), 2);
  assert.equal(severity(config, 'mktplace/no-html-head'), 1);
  assert.equal(severity(config, 'mktplace/no-sync-script'), 2);
  assert.equal(severity(config, 'mktplace/no-inline-script-id'), 2);
  assert.equal(severity(config, 'mktplace/no-async-client-component'), 1);
  assert.equal(severity(config, 'mktplace/no-server-only-imports-in-client'), 2);
  assert.equal(severity(config, 'mktplace/no-server-env-in-client'), 2);
});

test('rejects conditional Hooks and inaccessible JSX', async () => {
  const ids = await ruleIds(`
    import { useState } from 'react';
    export function Broken({ enabled }: { enabled: boolean }) {
      if (enabled) useState(0);
      return <img src="/product.png" />;
    }
  `);
  assert.ok(ids.includes('react-hooks/rules-of-hooks'), ids.join(', '));
  assert.ok(ids.includes('jsx-a11y/alt-text'), ids.join(', '));

  const depsIds = await ruleIds(`
    import { useEffect } from 'react';
    export function MissingDependency({ value }: { value: string }) {
      useEffect(() => { console.log(value); }, []);
      return <div aria-label-invalid="bad" />;
    }
  `);
  assert.ok(depsIds.includes('react-hooks/exhaustive-deps'), depsIds.join(', '));
  assert.ok(depsIds.includes('jsx-a11y/aria-props'), depsIds.join(', '));
});

test('rejects common TSX lint errors and the TypeScript compiler rejects a type mismatch', async () => {
  const ids = await ruleIds('export const value: any = 1;');
  assert.ok(ids.includes('@typescript-eslint/no-explicit-any'), ids.join(', '));

  const dir = mkdtempSync(path.join(tmpdir(), 'mktplace-ts-negative-'));
  try {
    const file = path.join(dir, 'type-error.ts');
    writeFileSync(file, 'const count: string = 1;\n');
    const tsc = path.join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc');
    const result = spawnSync(process.execPath, [tsc, '--noEmit', '--strict', '--target', 'ES2022', file], {
      encoding: 'utf8',
      windowsHide: true,
    });
    assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /TS2322/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('enforces core Next image, internal-link and App Router component guidance', async () => {
  const ids = await ruleIds(`
    import Document from 'next/document';
    export function Broken() {
      return <><head><title>Bad</title></head><img src="/logo.png" alt="Logo"/><a href="/settings">Settings</a><script src="/legacy.js"/></>;
    }
    const Head = require('next/head');
    const AlsoDocument = require('next/document');
  `);
  assert.ok(ids.includes('mktplace/no-html-image'), ids.join(', '));
  assert.ok(ids.includes('mktplace/require-next-link'), ids.join(', '));
  assert.ok(ids.includes('mktplace/no-next-head-import'), ids.join(', '));
  assert.ok(ids.includes('mktplace/no-next-document-import'), ids.join(', '));
  assert.ok(ids.includes('mktplace/no-html-head'), ids.join(', '));
  assert.ok(ids.includes('mktplace/no-sync-script'), ids.join(', '));

  const scriptIds = await ruleIds(`
    import Script from 'next/script';
    export function Broken() { return <Script>window.alert('missing id');</Script>; }
  `);
  assert.ok(scriptIds.includes('mktplace/no-inline-script-id'), scriptIds.join(', '));

  const identifiedScriptIds = await ruleIds(`
    import Script from 'next/script';
    export function Valid() { return <Script id="notice-script">window.alert('identified');</Script>; }
  `);
  assert.ok(!identifiedScriptIds.includes('mktplace/no-inline-script-id'), identifiedScriptIds.join(', '));

  const asyncIds = await ruleIds(`
    'use client';
    export default async function ClientComponent() { return <div/>; }
  `);
  assert.ok(asyncIds.includes('mktplace/no-async-client-component'), asyncIds.join(', '));

  const strictClientIds = await ruleIds(`
    'use strict';
    'use client';
    import { issueOAuthState } from '../src/lib/db/oauth-store';
    export function ClientComponent() { return <span>{String(issueOAuthState)}</span>; }
  `);
  assert.ok(strictClientIds.includes('mktplace/no-server-only-imports-in-client'), strictClientIds.join(', '));
});

test('blocks server-only imports and private environment access from client modules', async () => {
  const ids = await ruleIds(`
    'use client';
    import { issueOAuthState } from '../src/lib/db/oauth-store';
    import { auth } from '@/auth';
    import { auth as relativeAuth } from '../auth';
    import { headers } from 'next/headers';
    const nodeProcess = globalThis.process;
    const privateEnv = process.env[name];
    const privateAlias = nodeProcess?.env?.DATABASE_URL;
    const requiredServerModule = require('../src/lib/security/token-vault');
    export function Leak() { return <span>{process.env.DATABASE_URL}{String(issueOAuthState)}{String(auth)}{String(relativeAuth)}{String(headers)}{String(privateEnv)}{String(privateAlias)}{String(requiredServerModule)}</span>; }
  `);
  assert.ok(ids.includes('mktplace/no-server-only-imports-in-client'), ids.join(', '));
  assert.ok(ids.includes('mktplace/no-server-env-in-client'), ids.join(', '));

  const aliasMessages = await ruleMessages(`
    'use client';
    const nodeProcess = globalThis.process;
    nodeProcess?.env?.DATABASE_URL;
  `);
  assert.ok(aliasMessages.some(({ ruleId, line }) =>
    ruleId === 'mktplace/no-server-env-in-client' && line === 4), JSON.stringify(aliasMessages));

  const localProcessIds = await ruleIds(`
    'use client';
    export function Client({ job }: { job: { process: string } }) {
      return <span>{job.process}</span>;
    }
    export function LocalProcess(process: { env: { DATABASE_URL: string } }) {
      return <span>{process.env.DATABASE_URL}</span>;
    }
  `);
  assert.ok(!localProcessIds.includes('mktplace/no-server-env-in-client'), localProcessIds.join(', '));

  const publicEnvIds = await ruleIds(`
    'use client';
    export function PublicSettings() {
      return <span>{process.env.NODE_ENV}{process.env.NEXT_PUBLIC_FEATURE_FLAG}</span>;
    }
  `);
  assert.ok(!publicEnvIds.includes('mktplace/no-server-env-in-client'), publicEnvIds.join(', '));
});
