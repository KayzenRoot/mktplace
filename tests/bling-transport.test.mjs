import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { BLING_API, BlingError, issueOAuthState, verifyOAuthState, authorizationUrl, exchangeToken, probeProducts } from '../src/lib/bling/transport.ts';

test('state cryptographically unique, expires, bound to session', () => {
 const s=issueOAuthState('session1',1000), t=issueOAuthState('session1',1000);
 assert.equal(s.state.length,43); assert.notEqual(s.state,t.state);
 const i={state:s.state,expectedStateHash:s.stateHash,sessionBinding:'session1',expectedSessionHash:s.sessionHash,expiresAt:s.expiresAt,now:2000};
 assert.doesNotThrow(()=>verifyOAuthState(i));
 assert.throws(()=>verifyOAuthState({...i,sessionBinding:'session2'}),{code:'INVALID_STATE'});
 assert.throws(()=>verifyOAuthState({...i,state:t.state}),{code:'INVALID_STATE'});
 assert.throws(()=>verifyOAuthState({...i,now:s.expiresAt}),{code:'STATE_EXPIRED'});
 const url=new URL(authorizationUrl('client',s.state));
 assert.equal(url.origin,'https://www.bling.com.br'); assert.equal(url.searchParams.get('response_type'),'code');
 assert.equal(url.searchParams.get('state'),s.state);
});

test('code grant: one request, Basic credentials, JWT header, no sensitive response leakage', async () => {
 let count=0;
 const http=async(url,options)=>{
  count++;
  assert.equal(url,BLING_API+'/oauth/token'); assert.equal(options.method,'POST'); assert.equal(options.redirect,'error');
  assert.equal(options.headers['enable-jwt'],'1');
  assert.equal(options.headers.Authorization,'Basic '+Buffer.from('client:secret').toString('base64'));
  assert.equal(new URLSearchParams(options.body).get('grant_type'),'authorization_code');
  assert.equal(new URLSearchParams(options.body).get('code'),'oneTime');
  return new Response(JSON.stringify({access_token:'jwt',refresh_token:'refresh1',token_type:'Bearer',expires_in:21600}),{status:200});
 };
 const token=await exchangeToken({clientId:'client',clientSecret:'secret',grant:{type:'authorization_code',code:'oneTime'},http});
 assert.equal(count,1); assert.equal(token.accessToken,'jwt');
});

test('refresh grant returns rotated refresh token and errors are sanitized',async()=>{
 const http=async(_,options)=>{
  assert.equal(new URLSearchParams(options.body).get('refresh_token'),'old');
  assert.equal(options.headers['enable-jwt'],'1');
  return new Response(JSON.stringify({access_token:'newJwt',refresh_token:'new',token_type:'Bearer',expires_in:3600}),{status:200});
 };
 const t=await exchangeToken({clientId:'client',clientSecret:'secret',grant:{type:'refresh_token',refreshToken:'old'},http});
 assert.equal(t.refreshToken,'new');
 await assert.rejects(exchangeToken({clientId:'client',clientSecret:'secret',grant:{type:'authorization_code',code:'bad'},http:async()=>new Response('should-not-leak-secret',{status:401})}), e=>{
  assert.equal(e.code,'UPSTREAM_AUTH'); assert.ok(!String(e).includes('should-not-leak')); return true;
 });
 await assert.rejects(exchangeToken({clientId:'client',clientSecret:'secret',grant:{type:'authorization_code',code:'bad'},http:async()=>new Response(JSON.stringify({access_token:'only'}),{status:200})}),{code:'INVALID_RESPONSE'});
});

test('read probe fixed host, JWT Bearer, never returns catalog, errors never retry',async()=>{
 let calls=0;
 const ok=await probeProducts('jwt',async(url,opts)=>{
  calls++; assert.equal(url,BLING_API+'/produtos?pagina=1');
  assert.equal(opts.method,'GET'); assert.equal(opts.redirect,'error');
  assert.equal(opts.headers['enable-jwt'],'1'); assert.equal(opts.headers.Authorization,'Bearer jwt');
  return new Response(JSON.stringify({data:[{nome:'PRIVATE CATALOG'}]}),{status:200});
 });
 assert.equal(calls,1); assert.deepEqual(Object.keys(ok).sort(),['checkedAt','healthy']);
 for(const [status,expected] of [[401,'UPSTREAM_AUTH'],[403,'SCOPE_DENIED'],[429,'RATE_LIMIT'],[500,'UPSTREAM_UNAVAILABLE']]){
  calls=0;
  await assert.rejects(probeProducts('jwt',async()=>{calls++;return new Response('private',{status})}),e=>e instanceof BlingError && e.code===expected);
  assert.equal(calls,1);
 }
});
