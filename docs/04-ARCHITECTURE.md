# Architecture | modular monolith
**Proposta, não implementada.** Monólito modular para evitar microserviços e custos operacionais prematuros.

```text
Browser (HTTPS)
   -> Next.js App Router (UI, Auth.js/Google OIDC, Owner ACL)
       -> Route Handlers/BFF (server-only)
           -> Integration Service (state, OAuth, refresh mutex, token vault)
               -> Bling API v3 (HTTPS)
           -> PostgreSQL (sessões, estado OAuth, tokens cifrados, auditoria)
           -> Future: jobs + rate-limiter + event inbox + reconciliação
```

## Stack definida como proposta
Next.js + TypeScript, Node runtime, Auth.js OIDC com Google como default **sujeito a configuração do proprietário**, PostgreSQL gerenciado, migrações tipadas (Drizzle sugerido), validação Zod, Vitest + Playwright, deployment em Vercel/host Node HTTPS e PostgreSQL separado. Versões concretas serão travadas com lockfile pela WO-001.
## Regras arquiteturais
- UI não fala com Bling, não lê nem persiste token; só API interna autenticada.
- Service/adapter Bling isolado de UI; client HTTP parametrizado para mock.
- Integração global single-company: máximo uma conexão ativa; owner_id fixo e company_id conferido.
- Operações assíncronas e webhooks entram somente após WO-001, nunca no request OAuth.
- Tokens atômicos com lock de refresh e criptografia autenticada; não salvar em localStorage.
- Requisições externas somente para allowlist exata de domínios Bling; proibir redirects arbitrários, SSRF.
- Logs estruturados com correlation ID e categorias de erro; scrub de code, CPF/CNPJ, tokens e dados fiscais.
- Falha de dependências retorna estado degradado; nunca tenta mutação automaticamente.
## Sequência OAuth
1. Proprietário autenticado inicia conexão; criar state aleatório e guardar **hash** em storage server-side vinculado à sessão, uso único, TTL 5 min.
2. Redirecionar à autorização oficial. Redirect e scopes definidos no cadastro do Bling; não aceitar URL dinâmica fornecida pelo cliente.
3. Callback lê code/state, confere state+sessão+validade e consome atomicamente.
4. Trocar code imediatamente (expira em 1 min) no endpoint oficial com Basic autenticado **server-side**, x-www-form-urlencoded e `enable-jwt: 1`.
5. Armazenar tokens cifrados e expirations, recuperar identidade da empresa por API se escopo disponível ou estabelecer pela primeira leitura segura com verificação posterior obrigatória.
6. Exibir conectado após sucesso, nunca expor JSON do token. Refresh atômico, armazenamento substituído após êxito, marcar reconexão se revogado.
## Contratos
Detalhes em `13-API-CONTRACTS.md`, `15-INTEGRATION-CONTRACTS.md`. Dados em `12-DATABASE-DATA-MODEL.md`.

## Future bounded context: Supplier Monitor (WO-BLG-009/010)
```text
Approved scheduler (hour(s) interval, adjustable)
  -> supplier-collector worker (Playwright; source allowlist; credentials in vault)
     -> normalized supplier snapshots (quantity/availability, checked_at, source)
     -> matcher (explicit vendor SKU -> Bling SKU; review ambiguous)
     -> change queue (diff, status + approval)
     -> guarded writeback adapter -> Bling (WO-BLG-010 only)
```
Não rodar browser headless em request interativo Next.js nem na WO-001. Jobs GitHub Actions agendados são opção de baixo custo para protótipo, não scheduler com SLA: podem atrasar ou ser desabilitados por inatividade (60 dias em repo público). Workflow com credenciais reais só em branch confiável e ambiente restrito, nunca PR de forks; alternadamente worker externo privado.
Invariant: `available_at_supplier` é um sinal externo, não `owned_stock`; recuperação de falha nunca transforma indisponibilidade de acesso em quantidade zero. Múltiplos fornecedores futuros por adapter, sem multi-tenant.

## Supplier Fulfilment model: On-demand, not physical-stock
A fonte externa informa **indicação** de compra, não quantidade física. Estados canônicos: `available_signal`, `unavailable_confirmed`, `unknown_stale_or_error` + `reserved_after_sale` (estado comercial local).
- `supplier_snapshot`: valor observado, método, confiança, instante e variante.
- `stock_policy`: quantidade física do ERP permanece intocada; disponibilidade virtual calculada para publicação conforme capacidade técnica do Bling/canais **somente após prova**.
- `reservation`: atomicidade local por SKU/variante e pedido (um hold ativo), idempotência e `pending_pickup` com data limite para confirmar fornecedor.
- Novo pedido -> marcar hold -> solicitar sincronização restrita no Bling/canais -> confirmar compra/retirada do item -> liberar somente após rechecagem. Em canais com eventual consistency, multi-venda simultânea pode ocorrer; exigir testes/risk acceptance e plano de cancelamento controlado.
- A interface não afirma `in stock` absoluto. Exibe última coleta e marca `unknown` quando ultrapassar TTL; evitar que erro de scrape dispare zero físico.
Frequência sugerida: inventário de catálogo em 4 horas; rechecagem priorizada por anúncios ativos em até 60 minutos somente se permitida e dentro de limite de páginas/servidor; antes de reabrir oferta, nova consulta. Não garantir execução no prazo via GitHub Actions.

## Evolução de módulos sem mudança de stack
O monólito modular mantém adapters `BlingAdapter`, `SupplierAdapter`, `LLMProvider`, `ImageProvider`, `MarketplacePolicyProvider` e `Outbox/JobRunner`. UI consome **BFF contracts tipados** e `MockRepository` durante as telas DEMO; em produção repositório real usa API Bling com OAuth e validação de owner+company.
`ProductDraft` não é produto Bling; `ProductBling` não é `ListingChannel`; `ListingChannel` contém idLoja, tipoIntegracao, status e timestamps confirmados na API. API `/anuncios` suporta create/update/publish/pause conforme OpenAPI; comprovar cobertura dos três canais no teste por loja. UI não faz automação de browser das interfaces Bling/marketplaces.
Orquestrador de agentes atua apenas no **desenvolvimento** e não executa ações comerciais. Workers de IA/BeHot usam fila/cron apenas nas WOs futuras.
