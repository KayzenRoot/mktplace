import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { assertOwnerClaims, OwnerAccessDenied } from '../src/lib/security/owner-identity.ts';

test('exact issuer+sub+verified email required, no email-only account takeover',()=>{
  const allowed={issuer:'https://accounts.google.com',subject:'sub-1',email:'owner@example.com'};
  const good={iss:allowed.issuer,sub:allowed.subject,email:allowed.email,email_verified:true};
  assert.equal(assertOwnerClaims(good,allowed).subject,'sub-1');
  for(const claim of [
    {...good,sub:'sub-2'}, {...good,iss:'https://evil.invalid'},
    {...good,email:'other@example.com'}, {...good,email_verified:false},
    {...good,email_verified:'true'}, {...good,email_verified:undefined},
    {...good,sub:undefined},
  ]) assert.throws(()=>assertOwnerClaims(claim,allowed),OwnerAccessDenied);
});
