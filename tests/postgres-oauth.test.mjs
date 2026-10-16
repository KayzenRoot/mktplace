import { strict as assert } from 'node:assert';
import { test, after } from 'node:test';
import { randomUUID, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { registerOAuthState,consumeOAuthState,upsertOwner,saveBlingTokens,
  refreshBlingTokens,connectionStatus } from '../src/lib/db/oauth-store.ts';

const url=process.env.TEST_DATABASE_URL;
if(process.env.CI && !url) throw new Error('CI must provision TEST_DATABASE_URL; no skipped database tests.');
const pool=url?new pg.Pool({connectionString:url,max:8}):null;
if(pool) after(async()=>await pool.end());
test('PostgreSQL schema + transaction tests (CI mandatory)',{skip:!pool},async(t)=>{
  await pool.query(readFileSync(new URL('../db/migrations/001_oauth_identity.sql',import.meta.url),'utf8'));
  const suffix=randomUUID();
  const owner={issuer:'https://accounts.google.com',subject:'test-'+suffix,email:'verified@example.com'};
  const ownerId=await upsertOwner(pool,owner);
  assert.equal(await upsertOwner(pool,owner),ownerId);
  await t.test('single-use state, concurrency, wrong session and expired',async()=>{
    const state=await registerOAuthState(pool,ownerId,'sessionA');
    const [a,b]=await Promise.allSettled([
      consumeOAuthState(pool,ownerId,'sessionA',state.state),
      consumeOAuthState(pool,ownerId,'sessionA',state.state)]);
    assert.equal([a,b].filter(x=>x.status==='fulfilled').length,1);
    assert.equal([a,b].filter(x=>x.status==='rejected').length,1);
    const another=await registerOAuthState(pool,ownerId,'sessionA');
    await assert.rejects(consumeOAuthState(pool,ownerId,'sessionWrong',another.state),{code:'STATE_REJECTED'});
    await consumeOAuthState(pool,ownerId,'sessionA',another.state);
    const expired=await registerOAuthState(pool,ownerId,'sessionA',Date.now()-400000);
    await assert.rejects(consumeOAuthState(pool,ownerId,'sessionA',expired.state),{code:'STATE_REJECTED'});
    const q=await pool.query('SELECT encode(state_hash,\'hex\') AS hash FROM oauth_state WHERE owner_id=$1',[ownerId]);
    assert.ok(q.rows.every(x=>!x.hash.includes('sessionA')&&!x.hash.includes(state.state)));
  });
  await t.test('ciphertext at rest and serialized refresh across workers',async()=>{
    const key=randomBytes(32);
    await saveBlingTokens(pool,ownerId,key,{
      accessToken:'plain-access-sentinel',refreshToken:'plain-refresh-sentinel',tokenType:'Bearer',expiresIn:1,
    },Date.now()-120000);
    const q=await pool.query('SELECT access_cipher,refresh_cipher FROM bling_connection WHERE owner_id=$1',[ownerId]);
    assert.ok(!JSON.stringify(q.rows).includes('plain-access-sentinel'));
    assert.ok(!JSON.stringify(q.rows).includes('plain-refresh-sentinel'));
    let count=0;
    const http=async(_url,opts)=>{
      count++;
      assert.equal(new URLSearchParams(opts.body).get('refresh_token'),'plain-refresh-sentinel');
      await new Promise(resolve=>setTimeout(resolve,75));
      return new Response(JSON.stringify({access_token:'rotated-access',refresh_token:'rotated-refresh',
        token_type:'Bearer',expires_in:3600}),{status:200});
    };
    const inputs={pool,ownerId,key,clientId:'mock-client',clientSecret:'mock-secret',http};
    const responses=await Promise.all([refreshBlingTokens(inputs),refreshBlingTokens(inputs)]);
    assert.equal(count,1);
    assert.equal(responses.filter(x=>x.refreshed).length,1);
    assert.equal((await connectionStatus(pool,ownerId)).status,'connected');
    const invalid=async()=>new Response('unauthorized',{status:401});
    await saveBlingTokens(pool,ownerId,key,{accessToken:'again',refreshToken:'invalid',tokenType:'Bearer',expiresIn:1},Date.now()-120000);
    const status=await refreshBlingTokens({...inputs,http:invalid});
    assert.equal(status.status,'reconnect_required');
    assert.equal((await connectionStatus(pool,ownerId)).status,'reconnect_required');
    const gone=await pool.query('SELECT access_cipher,refresh_cipher FROM bling_connection WHERE owner_id=$1',[ownerId]);
    assert.equal(gone.rows[0].access_cipher,null);
    assert.equal(gone.rows[0].refresh_cipher,null);
  });
});
