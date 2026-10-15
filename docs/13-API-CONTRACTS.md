# Internal API Contracts (propostos)
Todas as rotas `/api/` usam TLS e autenticação admin exceto callback OAuth (que exige sessão+state) e endpoints de saúde não sensíveis. JSON com `{ok, data?, error?: {code,message}, requestId}`.
## Rotas WO-001
- `GET /api/integrations/bling/status`: 200, `{status,connectedAt,lastOkAt,companyLinked}`; **nunca** tokens ou company PII.
- `POST /api/integrations/bling/connect`: auth, CSRF same-origin; 303 para Bling authorize ou JSON `authorizationUrl` fixa; gera state server.
- `GET /api/integrations/bling/callback?code&state`: valida state/sessão; troca code no servidor, limpa dados sensíveis da URL imediatamente com 303 para `/settings/integrations?result=...`; callback denial/invalid retornam erro sanitizado.
- `POST /api/integrations/bling/test`: somente admin; executa UMA leitura read-only mínima, devolve `{healthy,checkedAt}` sem payload.
- `POST /api/integrations/bling/disconnect`: confirmação expressa e CSRF; tentativa de revoke Bling, limpeza local; sucesso parcial identificado.
- `GET /api/health`: status técnico genérico sem vazar configuração ou tokens; opções se hospedagem requer monitor público.
## Códigos
401 não autenticado, 403 não owner, 409 state consumido/conflito, 422 invalid oauth state, 429 rate limit, 502 upstream Bling, 503 não provisionado e 500 sanitizado.
## Restrições
Nenhum endpoint interno proxy genérico `url`; path externo allowlist e payload validado; usuário não escolhe scopes/redirect/host por query.
Especificação detalhada implementada e versionada junto com testes de contrato na WO-001; ajustar erros de callback para UX sem expor detalhes.
