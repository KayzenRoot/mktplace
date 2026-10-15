# Decisions Ledger / ADRs
**Status global inicial: PROPOSED; nenhuma decisão está aprovada até a revisão/merge da PR documental.**

## ADR-001: Bling é source of truth
Proposta: o app consulta/cacheia mas não duplica ERP; writeback apenas por rotas auditadas. Motivo: evitar divergência comercial/fiscal.
## ADR-002: Monólito modular Next.js + PostgreSQL
Proposta: UI+BFF e módulos integráveis no mesmo deploy; separar por interfaces e responsabilidade, sem microserviços no MVP. Alternativa rejeitada: microserviços/filas já no bootstrap.
## ADR-003: Single owner / single Bling company
Proposta: 1 empresa, 1 admin, nenhuma interface pública; modelo futuro deixa scope `company_id` explícito. Alternativa: multi-tenant adiado.
## ADR-004: OIDC proprietário + MFA
Proposta: Auth.js e Google OIDC (sujeito a validação do ambiente), allowlist por issuer+sub/email verificado, MFA no IdP. Sem senha própria.
## ADR-005: OAuth Bling JWT e cripto
Proposta: Authorization Code server-only, state de uso único, `enable-jwt: 1`, AES-256-GCM at-rest, refresh serializado.
## ADR-006: Deploy gerenciado
Proposta: app hospedado via HTTPS gerenciado (Vercel ou equivalente) e PostgreSQL gerenciado; escolher após custo e segurança; não requer VPS ou Docker obrigatório.
## ADR-007: Write operations não automáticas
Proposta: fiscal e financeiro read-only até revisão HIGH_ASSURANCE dedicada; respeitar confirmação explícita para irreversíveis.
## ADR-008: Sem CodeRabbit obrigatório
Proposta: checks determinísticos e review técnico Git/CI, sem dependência de review pago.
## Próximas decisões
Escolha domínio/hosting/banco, OIDC provider exato, KMS/rotação, escopos Bling concretos, retenção LGPD, região de dados.
## Processo
Registrar razão, alternativa, trade-offs, data, autoria e evidence bundle ao aprovar/alterar; decisões de docs sem execução não viram fatos de produção.

## ADR-009: Repositório público com GitHub Actions
**Decisão expressa do Owner em 2026-10-15: CONFIRMED_BY_OWNER; formalização documental pendente merge desta PR.** Repositório MKTPlace permanece público para usar Actions runners padrão gratuitos. Código e CI públicos, mas UI/login e dados empresariais privados. Segredos em cofre e testes PR somente com mock. Alternativa repo privado rejeitada pelo Owner devido custo/limite de CI. Não converter visibilidade em tarefa automática.
## ADR-010: Coleta autenticada de fornecedor sem API
**Necessidade confirmada pelo Owner em 2026-10-15; arquitetura e política de estoque: PROPOSED.** Portal de fornecedor (categorias de produtos adultos) fornece disponibilidade de catálogo via conta do proprietário e compra com retirada. Futuro adapter Playwright estritamente autorizado e com rate limit; snapshots de fornecedor independentes de saldo físico Bling, mapeamento explícito, escrita somente em WO separada. Alternativas: API/CSV/feed oficial se fornecedor oferecer, preferido quando viável.
