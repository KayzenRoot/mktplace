import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import { parseVaultKey, encryptSecret, decryptSecret, SecretVaultError } from '../src/lib/security/token-vault.ts';

test('vault key requires exact 32 bytes, canonical base64 and no plaintext',()=>{
  const key=randomBytes(32);
  assert.ok(parseVaultKey(key.toString('base64')).equals(key));
  for(const bad of ['',Buffer.alloc(16).toString('base64'),'abc','AAAA==']) assert.throws(()=>parseVaultKey(bad),SecretVaultError);
});
test('AES-256-GCM envelope is randomized and owner/field-bound',()=>{
  const key=randomBytes(32), text='refresh-very-secret-value', aad='owner-1:connection-1:refresh';
  const a=encryptSecret(text,key,aad), b=encryptSecret(text,key,aad);
  assert.notEqual(a,b);assert.ok(!a.includes(text));
  assert.equal(decryptSecret(a,key,aad),text);
  assert.throws(()=>decryptSecret(a,key,'owner-2:connection-1:refresh'),SecretVaultError);
  assert.throws(()=>decryptSecret(a,key,'owner-1:connection-1:access'),SecretVaultError);
  assert.throws(()=>decryptSecret(a,randomBytes(32),aad),SecretVaultError);
  const p=a.split('.'); p[3]=Buffer.from('tampered').toString('base64url');
  assert.throws(()=>decryptSecret(p.join('.'),key,aad),SecretVaultError);
});
test('no key is accepted with an unknown envelope version',()=>{
  const key=randomBytes(32), cipher=encryptSecret('token',key,'x:y:access');
  assert.throws(()=>decryptSecret(cipher.replace(/^v1\./,'v9.'),key,'x:y:access'),SecretVaultError);
});
