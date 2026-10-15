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

## Modelagem FUTURA (não migrar durante WO-001)
- `supplier`: id, hostname permitido, status, polling_interval, last_ok_at (sem senha).
- `supplier_secret_ref`: supplier_id, key reference in vault e versão (sem valores em plaintext).
- `supplier_product`: supplier_id, external_id, variant_id, external_sku, price_decimal, availability_status enum (available/unavailable/unknown), observed_qty_nullable, checked_at, source_fingerprint, snapshot_version.
- `supplier_bling_mapping`: supplier_product_id, bling_product_id, matching_status, approved_by, last_reviewed_at; unique mapping e prevenção ambígua.
- `supplier_change`: before/after safe fields, detected_at, resolved_at, review/status, reconciliation_id.
- `bling_writeback_job`: approved_policy_id, dry_run, idempotency_key, target product, proposed change, final_status, audit reference (WO-BLG-010 somente).
Unidade e precisão: decimal para preço; status desconhecido não equivale a quantidade zero; chave externa única por fornecedor+variante; PII mínima e retenção definida na WO.

## Política comercial FUTURA, não criar durante WO-BLG-001
- `supplier_snapshot`: status com `available_signal/unavailable_confirmed/unknown`, variant unique key, capture_method, evidence_confidence, checked_at, expires_at. Coluna qty pode ser nula; input `1` em campo de compra não é estoque real.
- `virtual_offer_policy`: bling_sku, channel, enabled, exposure_limit (default proposta 1), freshness_ttl, fulfilment_sla, pause_when_unknown, updated_by.
- `virtual_offer_state`: sku+channel, last_published_qty, pending_change_id, last_bling_ack_at; **nunca** somar ao estoque físico.
- `supplier_fulfilment_hold`: bling_order_id/channel_order_id unique, sku+variant, reserved_at, status (held/awaiting_supply/collected/released/escalated), optimistic_version.
- `cost_reference`: supplier price, payment_method, observed_at, taxes_and_fees (quando conhecidos), avoid auto-pricing if incomplete.
Concurrência: unique active hold por SKU/variante para limite 1; integração multicanal deve reconciliar possíveis corridas externas.
