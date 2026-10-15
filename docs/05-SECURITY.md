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

## Portal de fornecedor autenticado (WO-BLG-009, futura)
- O proprietário autoriza acessar apenas a própria conta, dentro dos termos/políticas do site; não contornar CAPTCHA, MFA, limites, bloqueios nem coletar dados de terceiros.
- Credenciais de fornecedor, cookies, browser storageState e chaves cifrados em cofre/DB e nunca em code, Git, Actions artifacts, cache, screenshots, stack traces ou prompt de IA. Playwright avisa que storageState pode impersonar usuário.
- Segregar CI público (somente mocks) de coletor com segredos: menor privilégio, sem execução de código PR externo, workflow trusted default branch e segredos de ambiente controlados. `GITHUB_TOKEN` read-only para coleta, permissões explícitas, sem pull_request_target com código não confiável.
- Log seguro: registrar apenas `supplier_id`, timestamp, contagem, changed products e status/error code; sem HTML inteiro, nome de cliente, senha, cabeçalhos ou cookies.
- Proteção site não é erro para quebrar: ao surgir challenge/403/429/termos incompatíveis, suspender e pedir recuperação interativa autorizada. Backoff/circuit breaker.
- Sem writeback automático por scrape falho. Mapeamento ambíguo/variante faltando/estoque externo não confiável implica revisão humana. Testar efeitos em catálogo/marketplace antes de ativar qualquer atualização.

## Falhas operacionais de estoque sob demanda
- Race condition na venda multicanal: reservation hold transacional; não prometer sincronismo em tempo real do marketplace.
- Não alterar estoque físico por parsing de disponibilidade: escrever somente pela camada de writeback com prévia, escopo e prova de semântica do campo Bling/canal.
- A página privada do Owner pode conter CEP e dados pessoais. **NÃO arquivar print do usuário, HTML autenticado nem traces no repositório público**, inclusive em revisão.
- Compras/checkout automático na BeHot fora do escopo; sem armazenar dados de pagamento do proprietário.

## Secrets configurados via Settings do MKTPlace (future)
Input inicial credencial por HTTPS para backend autenticado (admin+reauth para writes), encrypt-at-rest com chave de cofre ou KMS; UI mostra status/redacted hint e rotação, **nunca** readback de senha/token. Provider APIs, BeHot username/password e cookies não ficam em frontend, banco plaintext, Actions público, snapshots, logs, markdown, prompts ou código. CSRF, SSRF, rate limit, partition by provider, owner ACL; segredos somente carregados no worker confiável; integração OAuth preferida quando suportada.
IA recebe somente dados de catálogo necessários, evitando CPF, endereços e dados fiscais; consentimento e licenças de imagens. Geração e publicação de itens adultos precisa respeitar a política de modelo e canal.
Ações de publicação/pausa são HIGH_ASSURANCE pela exposição comercial; fiscal é HIGH_ASSURANCE por irreversibilidade e deve seguir confirmação e evidências. Agentes de programação não recebem segredos em worktrees.
