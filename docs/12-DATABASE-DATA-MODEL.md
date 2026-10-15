# Database / Data Model (proposta)
Banco PostgreSQL com migrations, chaves e índices explícitos. PII mínima.
## owner_identity
`id UUID PK`, `oidc_issuer TEXT NOT NULL`, `oidc_subject TEXT UNIQUE NOT NULL`, `verified_email TEXT`, `created_at timestamptz`.
## auth_session
Sessão gerenciada pelo adaptador OIDC/Auth.js escolhido, `owner_id`, expiração, revogação. Se JWT cookie session, nada de token Bling nele.
## oauth_state
`id UUID PK`, `state_hash BYTEA UNIQUE`, `session_hash BYTEA`, `expires_at timestamptz`, `consumed_at timestamptz NULL`; TTL físico e índices.
## bling_connection
`id UUID PK`, `owner_id UUID FK`, `company_id TEXT NULL`, `status ENUM(pending,connected,reconnect_required,revocation_pending,disconnected)`, `access_cipher BYTEA`, `refresh_cipher BYTEA`, `encryption_key_version SMALLINT`, `token_expires_at timestamptz`, `refresh_expires_at timestamptz NULL`, `version BIGINT`, `connected_at timestamptz`, `last_ok_at timestamptz`, `last_error_code TEXT NULL`. Unique active owner/connection.
## audit_event
`id UUID PK`, `actor_id UUID NULL`, `action TEXT`, `resource TEXT`, `result TEXT`, `occurred_at timestamptz`, `correlation_id TEXT`; jamais tokens, code, payload.
## Invariantes
Uma conexão Bling ativa por instância; token de atualização com CAS/lock transacional, row-level privileges app; índices nos vencimentos e expirações; backup cifrado. Não armazenar payload real completo no WO-001.
## Futuros
Product/Order/Stock/Invoice/Payable/Receivable cache tables só nas próprias WOs, com empresa/IDs externos, timestamps de origem e sincronia.
