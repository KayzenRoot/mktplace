-- WO-BLG-001: initial single-owner integration schema. No personal/fiscal data.
CREATE TABLE IF NOT EXISTS owner_identity (
  id UUID PRIMARY KEY,
  oidc_issuer TEXT NOT NULL,
  oidc_subject TEXT NOT NULL,
  verified_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (oidc_issuer, oidc_subject)
);
CREATE TABLE IF NOT EXISTS oauth_state (
  state_hash BYTEA PRIMARY KEY CHECK (octet_length(state_hash) = 32),
  owner_id UUID NOT NULL REFERENCES owner_identity(id) ON DELETE CASCADE,
  session_hash BYTEA NOT NULL CHECK (octet_length(session_hash) = 32),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS oauth_state_expiry_idx ON oauth_state(expires_at);
CREATE TABLE IF NOT EXISTS bling_connection (
  owner_id UUID PRIMARY KEY REFERENCES owner_identity(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('connected','reconnect_required','disconnected')),
  access_cipher TEXT,
  refresh_cipher TEXT,
  key_version INTEGER NOT NULL DEFAULT 1 CHECK (key_version > 0),
  expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  last_ok_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  CHECK ((status = 'connected' AND access_cipher IS NOT NULL AND refresh_cipher IS NOT NULL AND expires_at IS NOT NULL) OR status <> 'connected')
);
CREATE TABLE IF NOT EXISTS audit_event (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES owner_identity(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  correlation_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
