# Security baseline
**Risco WO-001: HIGH_ASSURANCE** (autenticação e acesso a dados empresariais). Sem atalhos nos controles críticos.
## Threat model resumido
Atacantes: usuário web anônimo, conta admin comprometida, CSRF/callback forjado, interceptação de token, secrets em logs, SSRF, callback replay, concorrência em refresh, permissões Bling além do necessário.
## Controles NECESSARY
- Autenticação com provedor OIDC validado; email **verificado** e subject allowlist do owner, sessão HTTP-only Secure SameSite=Lax; MFA habilitado no provedor. Rota admin bloqueada por padrão.
- CSRF anti-state no OAuth: 256 bits CSPRNG, persistir hash, amarrar à sessão, TTL curto, comparação constante, consumo atômico e teste de replay. Não utilizar `state` como autenticação por si.
- `code` Bling é single-use com validade ~1 minuto: callback faz exchange imediatamente, sem filas nem retry automático em code já usado.
- TLS end-to-end; sessão e token never in query redirects pós-callback; resposta 303 para URL limpa.
- `BLING_CLIENT_SECRET`, `OWNER_EMAIL`, `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY` apenas secrets server; `TOKEN_ENCRYPTION_KEY` 32 bytes aleatórios, criptografia AES-256-GCM com nonce aleatório e versão de chave.
- Persistir access e refresh token cifrados, timestamps/expires; refresh com lock transacional por conexão e sem replay de refresh desatualizado.
- Não guardar credenciais nem dados fiscais em banco de logs, Sentry, analytics, HTML, localStorage ou repositório.
- Host outbound allowlist `api.bling.com.br` para API/token e `bling.com.br` ou `www.bling.com.br` para authorize oficial; outbound com timeouts e sem seguir redirect inesperado.
- Aplicar no app limitador próprio abaixo dos limites Bling; token endpoint especialmente restrito, falhar fechado em 401/403/invalid_grant.
- Desconectar exige reautenticação recente/confirmacão, revogar no Bling quando suportado e limpeza local; se revogação remota falhar, indicar explicitamente.
## Webhooks futuros
Somente fase posterior: HMAC SHA-256 sobre **raw body** e `X-Bling-Signature-256`, comparação constante, `eventId` único, empresa validada, 2xx rápido, fila e reprocessamento. Nunca habilitar endpoint público incompleto.
## Segurança fiscal/financeira
Modo leitura obrigatório até WO dedicada com RBAC/confirmation/dry-run/idempotência/reconciliação e teste de ações irreversíveis. Certificado A1 permanece no Bling.
## Procedimento de incidente
Revogar instalações/tokens no Bling; rotacionar Client Secret/KEY, invalidar sessões, auditar metadados sem conteúdo sensível, redeploy; documentar janela de acesso e recuperação em `16-MIGRATION-RECOVERY.md`.
