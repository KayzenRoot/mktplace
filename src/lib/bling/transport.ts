import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Trusted backend-only adapter. Does not expose routes or store tokens. */
export const BLING_API = 'https://api.bling.com.br/Api/v3';
const BLING_AUTHORIZE = 'https://www.bling.com.br/Api/v3/oauth/authorize';
type ErrorCode = 'INVALID_CONFIG' | 'INVALID_STATE' | 'STATE_EXPIRED' | 'UPSTREAM_AUTH' | 'UPSTREAM_UNAVAILABLE' | 'INVALID_RESPONSE' | 'SCOPE_DENIED' | 'RATE_LIMIT';
export class BlingError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode) { super(code); this.name = 'BlingError'; this.code = code; }
}
function nonempty(v: string): string {
  if (typeof v !== 'string' || !v || v.trim() !== v || /[\r\n]/.test(v)) throw new BlingError('INVALID_CONFIG');
  return v;
}
const digest = (v: string) => createHash('sha256').update(v).digest();
/** Must be stored server-side with a session binding, TTL and single-use atomic consume. */
export function issueOAuthState(sessionBinding: string, at = Date.now()) {
  nonempty(sessionBinding);
  const state = randomBytes(32).toString('base64url');
  return { state, stateHash: digest(state).toString('hex'), sessionHash: digest(sessionBinding).toString('hex'), expiresAt: at + 300000 };
}
/** Pure verification only. DB layer must atomically reject reuse. */
export function verifyOAuthState(input: { state: string; expectedStateHash: string; sessionBinding: string; expectedSessionHash: string; expiresAt: number; now?: number }): void {
  if ((input.now ?? Date.now()) >= input.expiresAt || !Number.isFinite(input.expiresAt)) throw new BlingError('STATE_EXPIRED');
  if (!/^[\w-]{43,}$/.test(input.state)) throw new BlingError('INVALID_STATE');
  const expected = Buffer.from(input.expectedStateHash, 'hex');
  const sessionExpected = Buffer.from(input.expectedSessionHash, 'hex');
  if (expected.length !== 32 || sessionExpected.length !== 32 || !timingSafeEqual(expected, digest(input.state)) || !timingSafeEqual(sessionExpected, digest(nonempty(input.sessionBinding)))) throw new BlingError('INVALID_STATE');
}
export function authorizationUrl(clientId: string, state: string) {
  nonempty(clientId);
  if (!/^[\w-]{43,}$/.test(state)) throw new BlingError('INVALID_STATE');
  const url = new URL(BLING_AUTHORIZE);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('state', state);
  return url.toString();
}
export type BlingToken = { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number };
/** One request only: authorization_code is single use and valid for ~1 minute. */
export async function exchangeToken(input: {
  clientId: string; clientSecret: string;
  grant: { type: 'authorization_code'; code: string } | { type: 'refresh_token'; refreshToken: string };
  http?: typeof fetch; signal?: AbortSignal;
}): Promise<BlingToken> {
  const clientId = nonempty(input.clientId), secret = nonempty(input.clientSecret);
  const form = new URLSearchParams();
  if (input.grant.type === 'authorization_code') {
    form.set('grant_type', 'authorization_code'); form.set('code', nonempty(input.grant.code));
  } else {
    form.set('grant_type', 'refresh_token'); form.set('refresh_token', nonempty(input.grant.refreshToken));
  }
  let response: Response;
  try {
    response = await (input.http ?? fetch)(BLING_API + '/oauth/token', {
      method: 'POST', headers: {
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'enable-jwt': '1',
      }, body: form.toString(), redirect: 'error', cache: 'no-store', signal: input.signal ?? AbortSignal.timeout(8000),
    });
  } catch { throw new BlingError('UPSTREAM_UNAVAILABLE'); }
  if (!response.ok) throw new BlingError([400,401,403].includes(response.status) ? 'UPSTREAM_AUTH' : 'UPSTREAM_UNAVAILABLE');
  let data: unknown;
  try { data = await response.json(); } catch { throw new BlingError('INVALID_RESPONSE'); }
  if (!data || typeof data !== 'object') throw new BlingError('INVALID_RESPONSE');
  const t = data as Record<string, unknown>;
  if (typeof t.access_token !== 'string' || !t.access_token || typeof t.refresh_token !== 'string' || !t.refresh_token ||
      t.token_type !== 'Bearer' || typeof t.expires_in !== 'number' || !Number.isSafeInteger(t.expires_in) || t.expires_in <= 0 || t.expires_in > 7776000)
    throw new BlingError('INVALID_RESPONSE');
  return { accessToken: t.access_token, refreshToken: t.refresh_token, tokenType: 'Bearer', expiresIn: t.expires_in };
}
/** Read-only health probe. Never returns catalogue JSON or product details. */
export async function probeProducts(accessToken: string, http: typeof fetch = fetch): Promise<{ healthy: true; checkedAt: string }> {
  nonempty(accessToken);
  let response: Response;
  try {
    response = await http(BLING_API + '/produtos?pagina=1', {
      method: 'GET', headers: { Authorization: 'Bearer ' + accessToken, 'enable-jwt': '1', Accept: 'application/json' },
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
  } catch { throw new BlingError('UPSTREAM_UNAVAILABLE'); }
  if (response.status === 401) throw new BlingError('UPSTREAM_AUTH');
  if (response.status === 403) throw new BlingError('SCOPE_DENIED');
  if (response.status === 429) throw new BlingError('RATE_LIMIT');
  if (!response.ok) throw new BlingError('UPSTREAM_UNAVAILABLE');
  return { healthy: true, checkedAt: new Date().toISOString() };
}
