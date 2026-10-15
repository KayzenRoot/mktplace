
# Execução multiagente | rapidez com rastreabilidade
**Operação:** orquestrador organiza agentes especializados na **mesma WO**. Mais agentes não substituem contexto, CI, independência de revisão, limites API ou aprovação; trabalho fora do WO não é autorizado.
## Papéis
| Agente | Contribuição | Limites |
|---|---|---|
| A0 Orquestrador | Context Lock, dependências, owner de arquivos, integração de resultados, revisão de riscos, PR/evidence | não promove checkpoint nem faz merge não aprovado |
| A1 UX/UI | design system, shell, telas da WO, fixtures, responsividade | sem tokens nem chamadas Bling reais |
| A2 Auth/Security | login owner, OAuth state, tokens cifrados, refresh | não logar secrets, HIGH_ASSURANCE |
| A3 Bling Contracts | adapter v3, mocks, type schemas e GET smoke | não escreve estoque fiscal ou anúncios na WO-001 |
| A4 QA/CI | testes unit/integration/E2E, workflows, security lint, review de acessibilidade | review final deve ser independente do autor |
| A5 Supplier (futuro) | parser BeHot, snapshots, SKU matching, TTL | sem scraping atual, sem credenciais em repo |
| A6 Content AI (futuro) | provider LLM, facts-only, drafts e QA | sem autopublicação |
| A7 Media AI (futuro) | imagens fiel ao SKU, pipeline open-source, licença | sem inventar características |
| A8 Marketplace/Operations (futuro) | anúncio via Bling, regra por canal, reserva, orders/financeiro | sem publicar até autorização/contratos |
## Paralelismo por escopo
WO-001: A1 (frontend), A2 (OAuth), A3 (adapter) e A4 (CI/QA) podem trabalhar em **worktrees isolados**, com interfaces compartilhadas e um Context Lock derivado do mesmo base SHA. A0 integra por commits regulares sem reescrita/force-push, executa ALL required checks no HEAD da PR e entrega Evidence Bundle para auditor independente.
Futuro: A5/A6/A7/A8 só são design/planejamento até que suas WOs sejam o NEXT NECESSARY INCREMENT. NÃO iniciar 8 WOs simultâneas nem merge paralelo de mudanças sem revisão.
## Protocolo A0
1. ANALYZE e SOURCE CHECK (checkpoint/ADRs/scope/DoD/architecture) -> Work Order ID estável e ownership de arquivos.
2. CONTEXT LOCK Git base SHA, fingerprints do Source Pack; em alteração relevante marcar STALE e recompilar.
3. PREFLIGHT ferramentas/teste/credenciais fake, contratos e fronteiras da WO.
4. Executor aplica somente o WO e corrige falhas introduzidas, realiza commit/push/PR.
5. QA e reviewer independente auditam head integrado, testes, CI, segurança, regressões, docs e Evidence Bundle.
6. APPROVED -> checkpoint delta revisado e merge protegido; CORRECTION REQUIRED -> mesma WO/PR; BLOCKED -> resolver antes de avançar.
## Regras do repositório público
CI mocks sem secretos, GITHUB_TOKEN read-only por default; proibir executar contribuições PR não confiáveis com secrets, Playwright storageState ou dados fiscais. Chaves ficam no ambiente de aplicação. Não vincular credenciais pessoais em agentes de código.
## Objetivo medível
Paralelismo para reduzir tempo de elaboração de UI, auth e testes da MESMA WO, não medida de progresso inventada. Performance só comparável medindo fluxo serial vs paralelo (tempo wall-clock, conflitos, CI e defects).
