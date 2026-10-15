# Test & Benchmark Plan
## WO-BLG-001: testes determinísticos (mock obrigatório)
- T001 anonimato -> 401/redirect seguro para todas as rotas.
- T002 login OIDC: subject/email allowlist, email não verificado negado, conta não autorizada negada; logout invalida sessão.
- T003 state distinto em cada tentativa; cookie/nonce com TTL; mismatch, missing, expired, replay, sessões trocadas negados.
- T004 callback: access_denied / invalid_code / 500/timeout / duplicate callback tratados sem vazamento e sem segunda troca.
- T005 exchange: Content-Type form, Basic backend only, `enable-jwt: 1`, endpoint Bling atual correto, code tratado em <60s.
- T006 criptografia: tokens não plaintext no DB; decodificação correta; chave incorreta falha fechado; não existe token no client bundle.
- T007 refresh: único sob N requisições concorrentes, aplica token rotacionado atomicamente, invalid_grant exige reconnect, nunca loop infinito.
- T008 leitura: GET autorizado com Bearer e header JWT; 401 refresh uma única vez, 403 scope denied sem refresh inútil, 429 backoff com jitter e limite.
- T009 disconnect: confirmação e cleanup; distinguir revogação remota falhou de sucesso.
- T010 logs/respostas/telemetria/redaction: nenhuma credencial, query authorization code ou PII.
- T011 lint, typecheck, unit, build, migrations testadas em banco efêmero, smoke browser E2E.
- T012 segurança: secret scanning, dependências vulneráveis críticas, headers/cookies, callback CSRF.
## Live integration (requer credenciais do proprietário)
Ambiente isolado + app Bling privado com scopes mínimos; smoke de conexão e uma leitura real sem escrever nem imprimir payload. Owner executa autorização interativa, nunca compartilha Client Secret no chat.
## Métricas-alvo propostas
> 95% dos callbacks controlados concluídos em menos de 5s internos (exceto disponibilidade externa); 0 erros graves; zero exposição de tokens; processo de refresh concorrente sem duplicatas; limite app no máximo 2 req/s por conta até observação.
Limites de tempo são objetivos de benchmark, não observações atuais.
## Evidence Bundle
base/head SHA, alteração por arquivo, comandos+exit codes, CI links, testes automatizados, traces com dados sanitizados, cenário de OAuth real quando disponível, benchmark, riscos, delta do checkpoint. Owner não pode atestar teste ao vivo não realizado.

## Plano FUTURO WO-BLG-009 / WO-BLG-010
- Fixture HTML de fornecedor autorizada e sem PII; login mock + sessão expirada, 2FA interativo não automatizado, 403/429, alteração DOM, tempo limite, seletor ausente, estoque desconhecido e dados parciais.
- Deduplicar SKU+variante, conferir matching vendor->Bling, impedir falso zero por erro, snapshot versionado e reconciliação.
- Scanner anti-secret em workflows, artifacts, traces, screenshots e storageState; análise de dependências Playwright.
- Estabelecer cadência aceitável com fornecedor, tests de carga gentil, alertas sobre erro de coleta/sem dados novos e data freshness.
- Writeback somente na WO-BLG-010 com dry-run, idempotência, revisão de diffs e casos regressivos sobre saldo físico; não usar conta real para testes destrutivos.
