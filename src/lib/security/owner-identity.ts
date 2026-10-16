/** Claim checks are an additional authorization layer AFTER trusted OIDC signature validation. */
export type VerifiedClaims = {
  iss?: unknown; sub?: unknown; email?: unknown; email_verified?: unknown;
};
export type OwnerAllowlist = { issuer: string; subject: string; email: string };
export class OwnerAccessDenied extends Error {
  constructor() { super('OWNER_ACCESS_DENIED'); this.name = 'OwnerAccessDenied'; }
}
export function assertOwnerClaims(claims: VerifiedClaims, allowed: OwnerAllowlist): {issuer:string; subject:string; email:string} {
  const exact = (v: unknown, expected: string) => typeof v === 'string' && !!expected && v === expected;
  if (!exact(claims.iss, allowed.issuer) || !exact(claims.sub, allowed.subject) ||
    !exact(claims.email, allowed.email) || claims.email_verified !== true ||
    allowed.email.trim() !== allowed.email || allowed.subject.trim() !== allowed.subject ||
    allowed.issuer.trim() !== allowed.issuer) throw new OwnerAccessDenied();
  return { issuer: allowed.issuer, subject: allowed.subject, email: allowed.email };
}
