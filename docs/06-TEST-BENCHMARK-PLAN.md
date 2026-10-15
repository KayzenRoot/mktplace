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

## Riscos funcionais de venda sob demanda (WO-BLG-010 FUTURE)
- Produto com preço, botão Comprar e campo Quantidade **não** comprova número em estoque; fixtures representam ambiguidade.
- SKU esgotado, variação esgotada, página 200 mas botão desabilitado, estoque desconhecido, preço distinto entre Pix/parcelado.
- Dois pedidos simultâneos de marketplaces diferentes para mesmo SKU -> apenas uma reserva local; validar comportamento de sincronização eventual dos canais, sem alegar garantia contra oversell.
- Pedido recebido, compra/retirada no fornecedor ainda não confirmada -> held, alerta e eventual escalonamento de indisponibilidade.
- Expiração de freshness, desafio de login, erro HTTP -> fail-safe para oferta virtual, **sem modificar saldo físico**.
- Anúncio de categoria restrita: per-channel preflight e bloqueio de publicação sem elegibilidade comprovada.
- Teste econômico: preço final >= custo por modalidade aplicável + taxas canal + frete + imposto + margem mínima configurada. Sem inferência de custo quando desconhecido.

## Planos FUTUROS para catálogo + canais + IA
- Testes de contrato gerados da OpenAPI Bling para `GET/POST /anuncios`, `PUT /anuncios/{id}`, `POST /anuncios/{id}/publicar` e `/pausar`, com escopo, idLoja, tipoIntegracao, quotas e erros; live por loja autorizada, sem item proibido.
- Sandbox/mock de catálogo com variantes + GTIN + specs ausentes; LLM nunca inventa ficha, declara campo UNKNOWN; 2 providers com timeout/fallback/custo; proteger prompt injection presente no HTML da BeHot.
- Image diff original/processada: fidelidade de geometria/cor e marca/etiqueta, licença e conformidade do anúncio; review humano antes de publicar.
- Oferta sob demanda: concorrência multicanal, pedido recebido, atualização atrasada, fornecedor unknown, publicação/pausa idempotentes, impossibilidade de promessa de estoque.
- UI E2E visual-first: fixture marcada DEMO, loading, erro, vazios, responsive, acessibilidade e rotas protegidas; páginas DEMO não consomem credencial real.
- Marketplace policy tests: SKU elegível e não elegível, restrições de imagens, EAN/GTIN faltante, categoria errada, denial e override proibido.
