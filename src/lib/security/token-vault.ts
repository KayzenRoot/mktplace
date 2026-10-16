import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

/** Envelope encryption primitive for server-side token persistence. No database writes. */
const SCHEME = 'v1';
export class SecretVaultError extends Error {
  constructor() { super('SECRET_VAULT_FAILURE'); this.name = 'SecretVaultError'; }
}

export function parseVaultKey(base64: string): Buffer {
  try {
    if (typeof base64 !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(base64)) throw new Error('invalid');
    const key = Buffer.from(base64, 'base64');
    if (key.length !== 32 || key.toString('base64') !== base64) throw new Error('invalid');
    return key;
  } catch { throw new SecretVaultError(); }
}

/** AAD must be derived server-side from authenticated owner+connection+field identity. */
export function encryptSecret(value: string, key: Buffer, aad: string): string {
  if (typeof value !== 'string' || value.length === 0 || !Buffer.isBuffer(key) || key.length !== 32 || !aad) throw new SecretVaultError();
  try {
    const nonce = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, nonce);
    cipher.setAAD(Buffer.from(aad, 'utf8'));
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [SCHEME, nonce.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.');
  } catch { throw new SecretVaultError(); }
}

export function decryptSecret(envelope: string, key: Buffer, aad: string): string {
  if (!Buffer.isBuffer(key) || key.length !== 32 || !aad || typeof envelope !== 'string') throw new SecretVaultError();
  try {
    const parts = envelope.split('.');
    if (parts.length !== 4 || parts[0] !== SCHEME) throw new Error('invalid envelope');
    const nonce = Buffer.from(parts[1], 'base64url');
    const tag = Buffer.from(parts[2], 'base64url');
    const value = Buffer.from(parts[3], 'base64url');
    if (nonce.length !== 12 || tag.length !== 16 || !value.length) throw new Error('invalid lengths');
    const decipher = createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAAD(Buffer.from(aad, 'utf8'));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(value), decipher.final()]).toString('utf8');
  } catch { throw new SecretVaultError(); }
}
