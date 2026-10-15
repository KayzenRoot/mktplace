import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { issueOAuthState, BlingError, exchangeToken, type BlingToken } from '../bling/transport';
import { encryptSecret, decryptSecret } from '../security/token-vault';
import type { OwnerAllowlist } from '../security/owner-identity';

type SqlClient = Pick<Pool, 'query'> | Pick<PoolClient, 'query'>;
const hash = (value: string) => createHash('sha256').update(value, 'utf8').digest();
const aad = (ownerId: string, field: 'access'|'refresh') => `bling:owner:${ownerId}:primary:${field}`;
export class StoreError extends Error {
  constructor(public readonly code: 'STATE_REJECTED'|'CONNECTION_MISSING'|'NOT_CONNECTED') {
    super(code); this.name = 'StoreError';
  }
}

/** Called only after asserting issuer, sub, verified-email from validated OIDC callback. */
export async function upsertOwner(db: SqlClient, owner: OwnerAllowlist): Promise<string> {
  const result = await db.query<{ id:string }>(
    `INSERT INTO owner_identity(id, oidc_issuer, oidc_subject, verified_email)
     VALUES($1,$2,$3,$4)
     ON CONFLICT(oidc_issuer,oidc_subject)
     DO UPDATE SET verified_email=EXCLUDED.verified_email RETURNING id`,
    [randomUUID(),owner.issuer,owner.subject,owner.email]);
  if (!result.rows[0]?.id) throw new Error('OWNER_PERSIST_FAILED');
  return result.rows[0].id;
}

export async function registerOAuthState(db: SqlClient, ownerId: string, sessionBinding: string, now = Date.now()) {
  const issued = issueOAuthState(sessionBinding,now);
  await db.query(
    `INSERT INTO oauth_state(state_hash,owner_id,session_hash,expires_at)
     VALUES($1,$2,$3,$4)`,
    [Buffer.from(issued.stateHash,'hex'),ownerId,Buffer.from(issued.sessionHash,'hex'),new Date(issued.expiresAt)]);
  return { state: issued.state, expiresAt: new Date(issued.expiresAt) };
}

/** One UPDATE acts as compare-and-swap: replay and cross-session attempts fail closed. */
export async function consumeOAuthState(db: SqlClient, ownerId: string, sessionBinding: string, state: string): Promise<void> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !sessionBinding) throw new StoreError('STATE_REJECTED');
  const r = await db.query(
    `UPDATE oauth_state SET consumed_at = clock_timestamp()
     WHERE state_hash=$1 AND owner_id=$2 AND session_hash=$3
       AND consumed_at IS NULL AND expires_at > clock_timestamp()
     RETURNING state_hash`,
    [hash(state),ownerId,hash(sessionBinding)]);
  if (r.rowCount !== 1) throw new StoreError('STATE_REJECTED');
}

export type ConnectionStatus = 'connected'|'reconnect_required'|'disconnected';
export async function connectionStatus(db: SqlClient, ownerId: string): Promise<{status:ConnectionStatus; connectedAt: string|null; lastOkAt:string|null}> {
  const r = await db.query<{status:ConnectionStatus;connected_at:Date|null;last_ok_at:Date|null}>(
    'SELECT status,connected_at,last_ok_at FROM bling_connection WHERE owner_id=$1',[ownerId]);
  return {status:r.rows[0]?.status ?? 'disconnected',
    connectedAt:r.rows[0]?.connected_at?.toISOString() ?? null,
    lastOkAt:r.rows[0]?.last_ok_at?.toISOString() ?? null};
}

/** Ciphertext only is ever persisted. One owner may have only one Bling connection. */
export async function saveBlingTokens(db: SqlClient, ownerId: string, key: Buffer, token: BlingToken, now = Date.now()): Promise<void> {
  const access = encryptSecret(token.accessToken,key,aad(ownerId,'access'));
  const refresh = encryptSecret(token.refreshToken,key,aad(ownerId,'refresh'));
  const expiry = new Date(now + Math.max(0, token.expiresIn - 30) * 1000);
  await db.query(
    `INSERT INTO bling_connection(owner_id,status,access_cipher,refresh_cipher,key_version,expires_at,connected_at)
     VALUES($1,'connected',$2,$3,1,$4,clock_timestamp())
     ON CONFLICT(owner_id) DO UPDATE SET
       status='connected',access_cipher=EXCLUDED.access_cipher,refresh_cipher=EXCLUDED.refresh_cipher,
       expires_at=EXCLUDED.expires_at,connected_at=EXCLUDED.connected_at,version=bling_connection.version+1`,
    [ownerId,access,refresh,expiry]);
}

type LockedConnection = { status:ConnectionStatus; access_cipher:string|null; refresh_cipher:string|null; expires_at:Date|null };
/** Uses DB row-level lock, so multiple workers cannot spend one rotated refresh token twice. */
export async function refreshBlingTokens(input: {
  pool: Pool; ownerId: string; key: Buffer; clientId: string; clientSecret: string;
  http?: typeof fetch; now?: ()=>number;
}): Promise<{ status: 'connected'|'reconnect_required'; refreshed:boolean }> {
  const client=await input.pool.connect();
  let inTransaction=false;
  try {
    await client.query('BEGIN'); inTransaction=true;
    const q=await client.query<LockedConnection>(
      'SELECT status,access_cipher,refresh_cipher,expires_at FROM bling_connection WHERE owner_id=$1 FOR UPDATE',[input.ownerId]);
    const row=q.rows[0];
    if (!row || row.status !== 'connected' || !row.access_cipher || !row.refresh_cipher || !row.expires_at) {
      await client.query('COMMIT'); inTransaction=false;
      return {status:'reconnect_required',refreshed:false};
    }
    if (row.expires_at.getTime() > (input.now?.() ?? Date.now()) + 30_000) {
      await client.query('COMMIT'); inTransaction=false;
      return {status:'connected',refreshed:false};
    }
    const refreshToken=decryptSecret(row.refresh_cipher,input.key,aad(input.ownerId,'refresh'));
    let fresh: BlingToken;
    try {
      fresh=await exchangeToken({clientId:input.clientId,clientSecret:input.clientSecret,grant:{type:'refresh_token',refreshToken},http:input.http});
    } catch (err) {
      if (err instanceof BlingError && err.code === 'UPSTREAM_AUTH') {
        await client.query(`UPDATE bling_connection SET status='reconnect_required',access_cipher=NULL,refresh_cipher=NULL,
          expires_at=NULL,version=version+1 WHERE owner_id=$1`,[input.ownerId]);
        await client.query('COMMIT'); inTransaction=false;
        return {status:'reconnect_required',refreshed:false};
      }
      throw err;
    }
    await saveBlingTokens(client,input.ownerId,input.key,fresh,input.now?.() ?? Date.now());
    await client.query('COMMIT'); inTransaction=false;
    return {status:'connected',refreshed:true};
  } catch (err) {
    if(inTransaction) await client.query('ROLLBACK').catch(()=>{});
    throw err;
  } finally { client.release(); }
}
