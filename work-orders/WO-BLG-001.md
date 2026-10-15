# WO-BLG-001 | Secure Bling API v3 Connection
**Status:** READY_AFTER_BOOT_APPROVAL (não iniciar antes da PR documental aprovada)
**Risk:** HIGH_ASSURANCE (autenticação privilegiada, acesso a recursos empresariais)
**Branch:** `feat/WO-BLG-001-secure-oauth`
**PR title:** `[WO-BLG-001] Secure Bling OAuth v3 connection`
**Context lock:** anexar SHA de base `main`, hashes README, Checkpoint, Scope, DoD, Architecture, Security, Integration Contracts, ADRs. Qualquer mudança relevante => STALE + rebase/recompilação.
## OBJECTIVE
Entregar primeiro incremento real: web app autenticado e seguro, OAuth Authorization Code Bling v3 com JWT, conexão/desconexão, refresh e smoke read-only. Sem sincronização comercial ainda.
## CONTEXT
Novo `KayzenRoot/mktplace` público no bootstrap; sem código anterior. Bling source-of-truth, single-owner/company. Regras de segurança têm prioridade sobre velocidade.
## SCOPE
1. Inspecionar repositório e Source Pack; registrar base SHA, arquivos existentes e incompatibilidades.
2. Inicializar Next.js/TypeScript, lint/typecheck/build/test/CI mínimos, layout pt-BR mobile-first.
3. Proteger app/admin com Auth.js Google OIDC subject allowlist e email verificado; MFA exigido no IdP; segregar sessões. Se provedor não configurável ainda, implementar mocks e relatar bloqueio de validação.
4. Criar esquema PostgreSQL versionado: owner, oauth_state hash/TTL/consume, bling_connection tokens AES-256-GCM, audit_event; secrets env server-only; modelo single connection.
5. `connect`: sessão proprietária, CSRF same-origin, nonce criptográfico, registrar hash + TTL, URL authorize via host oficial, sem scope/redirect controlado pelo usuário.
6. `callback`: autenticar sessão, validar state com compare constante, TTL, single-use transacional; trocar code em <60s, sem retry por erro de code; Basic e `enable-jwt: 1`; validar resposta e cifrar tokens; URL limpa 303.
7. `refresh`: com lock de DB/CAS, atualizar cifrados e expires atomica, manter JWT, lidar com invalid_grant/revogado/timeout/retry limite.
8. Adapter API Bling typed com timeouts, bearer+enable-jwt, limites max 2req/s e burst seguro; `test` em GET read-only da API oficial previamente conferido em OpenAPI/scopes; não exibir payload, somente health.
9. Tela `/settings/integrations` com estados e botões acessíveis; separação clara de reconnect e desconectar, confirmação em disconnect, revogação remota quando suportada.
10. Testes automáticos e Evidências, PR sem merge automático até auditoria.
## OUT OF SCOPE
Produto/estoque/pedidos/notas/financeiro listagem, mutações comerciais/fiscais, webhooks, multiempresa, IA, integração marketplace direta, domínios customizados sem definição, scraping e mudança de privacidade do repo.
## FILES / SOURCES TO READ
`README.md`, todos os `docs/*.md`, este WO, Git history e CI quando existirem.
Fontes externas: Bling `/aplicativos`, `/migracao-jwt`, `/limites`, `/referencia`, `/erros-comuns`, `/migracao-url`. Reconferir documentação online no preflight; registrar data e divergências.
## REQUIREMENTS
RF-001..006 e RNF-001..007; manter OAuth single-use. `code` expira 1 minuto e segundo uso pode revogar acesso.
Provar privacidade: sem Client Secret/access/refresh/code em HTML, respostas, log, source map, CI ou arquivos versionados. Limitar integração à conta/empresa autorizada. Nunca enviar credenciais reais ao chat.
## ARCHITECTURE RULES
Monólito modular Next.js BFF Node + Postgres gerenciado; scripts npm; adapter externo mockável, runtime env validate, DB migration; evitar filas e serviços extras no início. Versões pinadas com lockfile.
Sem tokens client-side. Expiração a partir de resposta. Upstream host allowlist. JSON read-only exposto apenas como estado resumido.
Se stack proposta conflitar com restrição concreta de hospedagem, documentar ADR e interromper alterações arquiteturais não aprovadas.
## CONSTRAINTS
- Público: NÃO inserir dados/segredos no repo.
- Sem deploy real sem acesso configurado/HTTPS; não chamar teste mock de validação real.
- Não disparar emissão fiscal ou escrita no Bling.
- Rate limit Bling 3/s, 120k/dia, 20 `/oauth/token`/60s IP; orçar requests e evitar tempestade de refresh.
- Não dispensar segurança/CI por velocidade, mas eliminar cerimônia repetitiva sem valor.
- Não redefinir escopos Bling automaticamente: alterar scopes revoga instalações.
- Access-control owner only, testes negativos obrigatórios, secrets strict.
## ACCEPTANCE CRITERIA
AC-01: Anônimo e não proprietário 401/403; owner autorizado apenas com email verificado + OIDC subject permitido.
AC-02: state original vs inválido/expirado/replay/cross-session coberto; callback rejeita sem trocar code.
AC-03: POST token Basic server-only, JWT header, sem duplicação; caminho atualizado.
AC-04: dados tokens cifrados DB; casos de chave inválida e rotação documentados; não enviados browser.
AC-05: refresh serializado sob concorrência, rotaciona atomicamente; invalid_grant vira reconnect sem loops.
AC-06: `/settings/integrations` consistente e keyboard accessible, conexão/teste/desconexão seguros.
AC-07: adapter GET mock passa; live smoke autorizado se credenciais/infra disponíveis.
AC-08: logs sensíveis redigidos e testes com strings sentinelas.
AC-09: comandos npm test/lint/typecheck/build, migração DB teste, E2E e security audit passam.
AC-10: PR + evidence bundle com SHA e resultado real; deploy HTTPS e real OAuth devem estar validados para WO ser APPROVED plenamente.
## TESTS
Executar T001..T012 em `docs/06-TEST-BENCHMARK-PLAN.md`; Vitest (unit/integration), Playwright (auth & callback), Postgres efêmero no CI, verificação vulnerabilidades e npm audit com mitigação de HIGH/CRITICAL.
Testar timeout, denied, 401, 403, 429, 500, payload malformado, clock skew, race refresh, cookie state, user impersonation, logs redigidos.
## DELIVERABLES
Código com testes, `.env.example` atualizado (sem segredos), README setup dev, scripts CI, migrations, tela e API interna, threat-test report, link deployment (quando houver), Evidence Bundle `evidence/WO-BLG-001.md`, Checkpoint Delta **proposto**.
## REVIEW FORMAT
Português brasileiro. Entregar resumo mudanças, base/head SHA, diff, escopo e requisitos cobertos, testes+CI, resultados do smoke ao vivo (ou NÃO EXECUTADO), security findings por severity, riscos, pendências, verdict recomendado e delta.
Reviewer independente verifica PR atual, checks e invariantes; não aceitar autodeclaração "completed".
## STOP CONDITION
Parar ao atingir todos ACs com evidências e abrir PR; se depender de credenciais/IdP/domínio do proprietário, completar implementação mock e PR mas sinalizar BLOCKED para validação live e deploy. Se houver HIGH/CRITICAL, CORRECTION REQUIRED no mesmo WO/PR; NÃO iniciar WO-BLG-002.
