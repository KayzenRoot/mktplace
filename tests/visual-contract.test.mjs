import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('M00 has a real navigable dashboard and explicit demo markers',()=>{
  assert.match(read('app/page.tsx'), /MODO DEMO|AppShell/);
  assert.match(read('src/components/AppShell.tsx'), /MODO DEMO/);
  assert.match(read('src/components/AppShell.tsx'), /settings\/integrations/);
});
test('M17 keeps external connection controls disabled until backend audit',()=>{
  const settings=read('app/settings/integrations/page.tsx');
  assert.match(settings, /Conectar Bling/);
  assert.match(settings, /disabled title=/);
  assert.doesNotMatch(settings, /process\.env\.BLING_CLIENT_SECRET/);
});
test('demo must fail closed on a production request',()=>{
  const guard=read('src/lib/demo-guard.ts');
  assert.match(guard, /NODE_ENV === 'production'/);
  assert.match(guard, /ALLOW_PUBLIC_DEMO !== 'true'/);
  assert.match(guard,/notFound\(\)/);
  assert.match(read('app/page.tsx'), /requirePreviewMode\(\)/);
  assert.match(read('app/settings/integrations/page.tsx'), /requirePreviewMode\(\)/);
});
test('canonical docs and architecture stay part of repo',()=>{
  assert.ok(existsSync(new URL('../docs/04-ARCHITECTURE.md', import.meta.url)));
  assert.ok(existsSync(new URL('../work-orders/WO-BLG-001.md', import.meta.url)));
});
