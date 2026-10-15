# Source Hierarchy e governança
**Pack:** 0.1.0-draft | **Status:** APPROVED FOR SOURCE PACK | **Data:** 2026-10-15

## Ordem canônica
1. `11-CHECKPOINT.md` (estado confirmado por evidência)
2. `10-DECISIONS-LEDGER.md` (ADRs aprovadas)
3. `03-SCOPE.md` (escopo e classificação)
4. `09-DEFINITION-OF-DONE.md` (DoD)
5. `04-ARCHITECTURE.md` (interfaces, componentes e restrições)
6. `02-REQUIREMENTS.md` (requisitos)
7. Contratos, Security, Test Plan, Deployment, Data Model, UI/UX e outros.

## Índice obrigatório
- `01-PROJECT-OVERVIEW.md` visão
- `02-REQUIREMENTS.md` RF/RNF e prioridades
- `03-SCOPE.md` inclusões, exclusões, sequência
- `04-ARCHITECTURE.md` desenho e invariantes
- `05-SECURITY.md` ameaças, controles e segredos
- `06-TEST-BENCHMARK-PLAN.md` prova técnica
- `07-DEPLOYMENT.md` ambientes e publicação
- `08-BACKLOG.md` execução incremental
- `09-DEFINITION-OF-DONE.md` gates objetivos
- `10-DECISIONS-LEDGER.md` ADRs
- `11-CHECKPOINT.md` estado e próximas ações
- `12-DATABASE-DATA-MODEL.md` armazenamento mínimo
- `13-API-CONTRACTS.md` API interna
- `14-UI-UX.md` experiência
- `15-INTEGRATION-CONTRACTS.md` API Bling e webhooks
- `16-MIGRATION-RECOVERY.md` restauração e falhas
- `17-TRACEABILITY.md` matriz requisito -> WO -> teste

## Regras
Toda versão utiliza WO com ID estável, contexto Git e evidence bundle. Sem implementação fora do WO.
Executor não aprova própria evidência nem promove Checkpoint Delta; auditor objetivo decide APPROVED / CORRECTION REQUIRED / BLOCKED.
Após APPROVED, atualizar fontes afetadas e checkpoint de forma verificável antes do merge, respeitando proteções.
Mudanças em decisões, Scope, Architecture, DoD ou checkpoint tornam WOs baseadas no contexto anterior STALE.
Não criar restrições redundantes: gates mínimos proporcionais ao risco; **não** dispensar auth, segregação, integridade, segredos e segurança fiscal.

- `18-SUPPLIER-MONITORING.md` contrato de coleta autorizada, separação de disponibilidade/estoque, proteção de segredos e gates de integração.

- `19-BEHOT-PUBLIC-DISCOVERY.md` constatações datadas sobre fonte pública do fornecedor e lacunas de validação.

- `20-MODULE-MAP.md` inventário completo de módulos e fronteiras, intenções e critérios.
- `21-FRONTEND-FIRST-DELIVERY.md` ordem das telas com mocks/contratos/vertical slices.
- `22-AI-PROVIDER-CONTRACTS.md` provedores text/imagem, compliance e verificabilidade.
- `23-MARKETPLACE-ELIGIBILITY.md` matriz de políticas e gates por SKU/canal.
- `24-MULTI-AGENT-PLAN.md` paralelismo seguro com WOs estáveis e CI final.
