# Decisions Ledger / ADRs
**Estado 2026-10-15: planejamento arquitetural aceito para iniciar WO-BLG-001, sujeito à integração da PR #1.** Decisões expressas do Owner (repositório público, opção B, UI-first, operação Bling e multiagentes) permanecem confirmadas. Propostas de arquitetura/integração dependem de implementação, testes e validações específicas de cada WO. Não são evidência de produto em produção.

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

## ADR-011: Reposição sob demanda a partir da BeHot
**Necessidade de negócio confirmada pelo proprietário (2026-10-15); solução técnica PROPOSED, aguardando revisão/merge.** Owner deseja anunciar produtos BeHot sem imobilizar capital em estoque: ao vender, compra online e retira no mesmo dia. A página autenticada mostra R$178,63 e R$151,84 Pix para um produto ilustrativo, mas não informa quantidade real. O botão Comprar é só indicação de disponibilidade.
**Proposta:** distinguir `supplier_available` de `owned_stock`, oferecer até 1 unidade virtual por SKU quando suporte Bling/canais comprovado, congelar anúncio ao receber pedido, refrescar antes de reabrir e reconciliar. Não lançar 1 unidade fictícia como patrimônio físico; não garantir entrega/suprimento, nem permitir anúncios de categorias vedadas. Alternativas: catálogo read-only com confirmação manual, cadastro virtual/depósito reservado quando API oficial admitir, sem escrita se campo adequado não existir.
**Não aprovado:** política exata de freeze TTL, oversell, canais, lucro e SLA; precisam de provas na WO-BLG-010.

## ADR-012: Single cockpit Bling como intermediador principal
**Owner intent CONFIRMED 2026-10-15; desenho PROPOSED.** ML/Shopee/Amazon integrados ao Bling; controlar cadastro, publicação, pedidos, fiscal e financeiro no MKTPlace, sem login manual cotidiano nos canais. Onboarding/autorização inicial externa ainda pode ser inevitável. Bling OpenAPI 2026 confirma Anúncios CRUD + publicar/pausar, mas suporte efetivo por canal depende de integração e permissões.
## ADR-013: UI-first com contratos e backend protegido
**Owner preference CONFIRMED; engenharia PROPOSED.** Construir design system e telas com fixtures sintéticas antes das integrações do domínio; usar contratos tipados, testes e labels DEMO; conectar backend por vertical slice sob WO aprovada. Nunca implementar UX inteira inoperante como 'done' ou deixar secrets no client.
## ADR-014: AI provider-agnostic enriquecimento de catálogo
**Owner intent CONFIRMED; desenho PROPOSED.** Texto via DeepSeek ou OpenAI, imagem com opção de processamento livre/local primeiro e opcional API. Camada plugável, orçamento/tokens, template, procedência de dados e verificação humana. Não inventar especificações nem modificar produto fisicamente na imagem.
## ADR-015: Multi-agent orchestration sob WO
**Owner preference CONFIRMED; implementação PROPOSED.** Um orquestrador coordena UX, Bling, BeHot, IA, QA/Segurança e operações em worktrees isolados; apenas subtarefas independentes dentro da mesma WO podem ocorrer em paralelo. Rebase e integração testada; gates APPROVED/CORRECTION REQUIRED/BLOCKED permanecem.
## ADR-016: Channel eligibility by item, no categorical allowance
**PROPOSED com base em políticas públicas 2026.** Mercado Livre tem categoria Adultos com 18+ e restrições; Amazon mantém regras 'Adult Products' para brinquedos; Shopee possui restrições fortes de conteúdo e regras de bem-estar sexual. Confirmar SKU/variante, Seller account, canal/formato e anúncios normais antes de publicar. Não renomear produto para evadir restrição.

### ADR-011 amendment: regra de reposição B escolhida
**2026-10-15 / CONFIRMED_BY_OWNER (intenção):** reconsultar BeHot após venda e reabrir uma oferta virtual se produto/variante permanecer disponível. Isso substitui preferência anterior de sempre aguardar confirmação manual de retirada antes de reabrir. Desenho de estoque e writeback permanece PROPOSED até auditoria e testes. Diferenciar escolha de regra de autorização para executar rotinas comerciais.
