# WO-BLG-001 — evidências do ambiente Docker local

**Data:** 2026-10-15
**Resultado deste incremento:** `LOCAL_READY`, com observação de Fast Refresh abaixo.
**Estado do produto:** WO-BLG-001 continua `IN PROGRESS / NÃO CONCLUÍDO`; este trabalho valida somente o fluxo de desenvolvimento local.

## Contexto e escopo

- Repositório: `KayzenRoot/mktplace`; branch `feat/WO-BLG-001-secure-oauth`; PR #5 deve permanecer draft.
- Checkout antes da integração local: `17eca0441efda0268d4aeb44fbd9a740a61ce47b`. Base `origin/main` observada no preflight: `08cf0f561b5ab5b0044d31667b2321cb4446ef60`.
- O checkpoint canônico ainda registra o HEAD anterior `9b64bb44992f65900178ff6850c8e243008738c7` e diz que `package-lock.json` não está versionado. O checkout atual contém o lockfile. Essa divergência foi preservada para revisão; nenhum checkpoint foi promovido ou editado.
- Sem credenciais Bling/OAuth reais, login de proprietário, deploy, escrita fiscal ou dados comerciais reais.

## Implementação local

- `Dockerfile.dev`, `compose.dev.yaml`, `.dockerignore`, `.env.docker.local.example` e scripts `dev-*`/`sync-github.ps1` criam um app Node.js 22 e PostgreSQL 17 isolados por identificador de instância. A imagem copia uma lista explícita de manifests, código, testes, migração e documentos exigidos; não usa `COPY . .`.
- `scripts/dev-compose-context.ps1` centraliza a validação da instância, os argumentos do Compose e a restauração das variáveis de ambiente dos comandos locais.
- App publicado em `127.0.0.1:3000` no estado final verificado; o Postgres não publica porta no host. Durante a primeira inicialização, 3000/3001 estavam ocupadas e o app iniciou em 3002; uma execução posterior voltou a 3000 depois que a porta ficou livre.
- `.env.docker.local` foi criado com valores aleatórios locais, permanece ignorado pelo Git e não teve seus valores incluídos em logs ou nesta evidência. O exemplo versionado é modelo, não arquivo de execução.
- O modo de desenvolvimento usa Webpack com polling para alterações de arquivos em Docker Desktop Windows. O build de produção continua sendo validado pelo script normal do projeto.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| PowerShell Parser dos 6 scripts `dev-*`, `sync-github.ps1` e helper compartilhado | PASS |
| `docker compose config --quiet` | PASS na configuração final |
| `git diff --check` | PASS |
| `dev-check.ps1` | PASS: lint, typecheck, 15 testes (incluindo Postgres) e build Next.js; 0 falhas e 0 testes ignorados |
| Lint | PASS com 1 warning preexistente de `CreditCard` não usado em `src/components/AppShell.tsx` |
| Migração local | PASS; 4 tabelas públicas (`audit_event`, `bling_connection`, `oauth_state`, `owner_identity`) |
| `GET /` e `GET /settings/integrations` | HTTP 200; conteúdo informa modo de demonstração e ausência de dados reais |
| Fast Refresh de arquivo existente | PASS; mudança temporária no título foi servida por HTTP e `app/page.tsx` foi restaurado com SHA-256 idêntico |
| Persistência no ciclo `dev-down.ps1`/`dev-up.ps1` | PASS; o mesmo conjunto de 4 tabelas permaneceu após reinício, sem reaplicar migração |
| Isolamento de porta do banco | PASS; `docker port ... 5432/tcp` informou que não há porta pública publicada |
| Source Pack | PASS em Node 22/Linux: 29 arquivos canônicos, seções da WO, links e marcadores de segredo |
| `npm audit --omit=dev --audit-level=high` | PASS: 0 vulnerabilidades |
| Scanner dedicado de segredos | Indisponível no host; não foi alegada cobertura por gitleaks/trufflehog. Verificação de marcadores do Source Pack passou |
| Captura da UI | Capturada no navegador local e apresentada na conversa; mostra o painel DEMO, sem dados reais |

O Docker Desktop avisou que dois volumes antigos de cache com sufixo `-current` não correspondem ao hash atual do lockfile. Eles foram preservados sem limpeza manual; o banco persistente desta instância não foi removido.

### Observação sobre watcher

Uma rota nova criada temporariamente no bind mount foi visível dentro do container, mas não apareceu em HTTP após 3 minutos; o arquivo foi removido. A edição de um arquivo de rota já carregado passou com Webpack/polling. A documentação do Next.js informa que eventos de arquivos em mounts do Docker Desktop Windows podem atrasar ou deixar de ser propagados; alterações de arquivos já observados funcionaram neste host. Se novas rotas não aparecerem, reinicie o serviço de desenvolvimento ou mova o checkout para o sistema de arquivos Linux do WSL2.

## Governança e pendências

- O checkpoint canônico continua inalterado. Delta proposto: documentar e habilitar o ciclo local Docker/Compose do Windows, com banco persistente de desenvolvimento, banco de teste efêmero, portas isoladas e Fast Refresh por polling.
- O CI preexistente e o estado ao vivo da PR devem ser conferidos novamente no HEAD final depois do commit.
- A WO de produto permanece bloqueada para validação real de identidade/OIDC, OAuth Bling, token vault, smoke read-only autorizado, auditoria independente e deploy HTTPS. Não declarar o produto aprovado por causa deste ambiente local.
- Nenhum merge, promoção de checkpoint ou deploy foi realizado.

## Referências

- [Guia de desenvolvimento local](../docs/LOCAL-DEVELOPMENT.md)
- [Work Order canônica](../work-orders/WO-BLG-001.md)
- [Checkpoint canônico preservado](../docs/11-CHECKPOINT.md)
- [Guia local do Next.js](https://nextjs.org/docs/app/guides/local-development)
