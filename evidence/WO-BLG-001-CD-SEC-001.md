# Evidence Bundle — WO-BLG-001 / CD-SEC-001

**Estado:** correção de dependência e lint executada; veredito do executor: **BLOCKED** porque AC-CD05 não pôde ser validado neste ambiente. A revisão independente do código em 1ac63d1 não encontrou outro defeito concreto nem HIGH/CRITICAL conhecido; a confirmação final do HEAD documental ainda será solicitada.
**Data:** 2026-10-16
**Work Order:** WO-BLG-001
**Correction Delta:** CD-SEC-001
**PR:** [#5, mantida em draft](https://github.com/KayzenRoot/mktplace/pull/5)
**Branch remota:** feat/WO-BLG-001-secure-oauth
**Base da correção:** 386bbfac769cf492350751453e14f95aec97a89b
**Base main do Source Pack:** 08cf0f561b5ab5b0044d31667b2321cb4446ef60
**HEAD de código revisado e validado:** 1ac63d12e6764c6aeafa778115e6bc24f749ffad
**HEAD final com esta evidência:** será registrado no corpo da PR depois do commit documental. O SHA acima identifica o código coberto pelos testes, CI e revisão atuais.

Este pacote trata somente de CD-SEC-001. Não inclui alterações Auth/OAuth locais, não promove checkpoint e não autoriza merge, deploy ou publicação.

## Objetivo e resultado técnico

Remover a cadeia vulnerável de lint que trazia braces 3.0.3, sem perder os controles essenciais de lint, e exigir auditoria npm completa e de produção no CI. A consulta ao [GitHub Advisory GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), em 2026-10-16, lista braces até 3.0.3 como afetado e nenhuma versão corrigida. O advisory descreve exaustão de pilha por padrões de chaves profundamente aninhados.

A cadeia removida era eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces 3.0.3. Next.js, React e versões diretas não foram rebaixados. Não houve override vulnerável, exceção de audit ou uso do audit de produção como único gate.

A substituição usa ESLint Flat Config, typescript-eslint, regras React/Hooks e JSX a11y, mais regras locais em scripts/eslint/mktplace-plugin.mjs. A regra local de ambiente do cliente agora diferencia o global process de bindings locais e propriedades chamadas process; fixtures cobrem job.process, parâmetro process.env e o alias globalThis.process. A revisão independente encontrou esse falso positivo no SHA 08b6dd5; a correção e a fixture foram commitadas em 1ac63d1. O revisor reavaliou o código e não encontrou outro defeito concreto.

A regra equivalente a @next/next/inline-script-id foi restaurada como mktplace/no-inline-script-id, com fixtures negativa e positiva. A implementação de referência do Next 16.4.1 está em [inline-script-id.ts](https://github.com/vercel/next.js/blob/v16.4.1/packages/eslint-plugin-next/src/rules/inline-script-id.ts).

## Arquivos da correção

| Arquivo | Alteração |
|---|---|
| package.json, package-lock.json | Removem o preset de lint Next e sua cadeia; preservam Next/React. |
| eslint.config.mjs | Configuração Flat Config e severidades explicitadas. |
| scripts/eslint/mktplace-plugin.mjs | Guardas locais de Next, imports server-only, env privado no cliente e id em scripts inline. |
| tests/lint-config.test.mjs | Testes de severidades, fixtures negativas/positivas e falsa rejeição de nomes locais. |
| .github/workflows/ui-foundation.yml | Exige npm audit completo e audit de produção. |
| Dockerfile.dev | Inclui o plugin local na imagem de desenvolvimento. |
| evidence/WO-BLG-001-CD-SEC-001.md | Este pacote de evidências; Checkpoint Delta permanece proposto. |

Os commits publicados nesta correção são:
- a34cb48 — remove a cadeia vulnerável e atualiza lint/CI.
- 0579a9e — pacote inicial de evidências.
- 5ceb9ad — deduplica visitors e cobre alias de env no cliente.
- 08b6dd5 — restaura proteção de id em script inline.
- 1ac63d1 — ignora bindings locais process sem liberar env global.

## Source Pack e fingerprints SHA-256

O Source Pack hospedado passou no SHA de código. Os documentos canônicos listados permaneceram iguais à base main; hashes das fontes usadas nesta correção:

| Fonte | SHA-256 |
|---|---|
| docs/11-CHECKPOINT.md | 5543c37d9158231d464d825c45b50a412dd0ff5ba218445a6b29ebec22c707c9 |
| docs/10-DECISIONS-LEDGER.md | 9608cc7abaa988adec9b2bb465094ae3d422bb3d4ead69800b4653c722afeeb5 |
| docs/03-SCOPE.md | 49cb7b8f05235d55b8fd8813145cefffa09e520798ff0c0b707ba83a68fd3e71 |
| docs/09-DEFINITION-OF-DONE.md | 3ad522b3bbd8cb877c2b8971e15a31b29e80492966beebd6b09f05f4bd5a0b23 |
| docs/04-ARCHITECTURE.md | a9993feac6e966ebbdcc57ceff7c854afbbe30ad8d6343bf095941d44e7f2953 |
| docs/02-REQUIREMENTS.md | 94c2e35d383c3a3ca111077e9657e3edf01afaf449076d2e7fd4c638c309b849 |
| docs/05-SECURITY.md | 5bd90ebae07a6879868c6d74569373991a640a7bfe35d5de4813759c6adfb86b |
| docs/06-TEST-BENCHMARK-PLAN.md | a8f51823d62bdeaa8ae67e5ed91569445e8fde211e5a8352915f290f56bbe46e |
| work-orders/WO-BLG-001.md | 9d8ff0f1cb4b5f9ae9ab6775d636badd03b930ff4ebc58aebfc34b016d01d9b7 |
| docs/LOCAL-DEVELOPMENT.md | 4e112319974cba03b60aba7afb311d8b1fcb774ddf8664f6d9ffb08527d5dfea |
| package.json | 421326572a76d6a938346daf7ea660251acdaa4f8ab37f52e03b427ef67f5ee9 |
| package-lock.json | fdcddf35fc6943904683f0d562a642dee14b37fc72d9dc6348daf3eed9d27935 |
| eslint.config.mjs | 4246e441db29b05086c8ee3ec44393a6d940efdf871ac9ebc7ecb000499d45e3 |
| scripts/eslint/mktplace-plugin.mjs | 30417150c89e3c2f865ee3ef7f78edff5a04bd3a65baf1bf4f83e8b390cd0cfa |
| tests/lint-config.test.mjs | 924c5ea50e6204657c89a7b2504995931b74fc1db5f5a9bbb037e940d3d9132a |
| .github/workflows/ui-foundation.yml | 1b670a2e35d980d5970bdaeb56da7bb12e85d7e08328c27eada4b9e1b009f3a7 |
| Dockerfile.dev | 28b260292eeeaa0e860b5e199ba1d124b556e10dd6df029209026d67400c6750 |
| compose.dev.yaml | d210ed45bbc71929458b124e541b84f226032df258fffa4ca4c9aec663a72b19 |
| scripts/dev-check.ps1 | da96ac7d3e83e822d994ad2080048e80007688d90433354b4f25b6ea477ca1d9 |

## Grafo npm

| Verificação | Resultado |
|---|---|
| Lockfile da base 386bbfa | Continha eslint-config-next e a cadeia até braces 3.0.3. |
| Lockfile atual | Não contém braces, micromatch, fast-glob, eslint-config-next ou @next/eslint-plugin-next. |
| npm audit --audit-level=high | Exit 0; zero vulnerabilidades. |
| npm audit --omit=dev --audit-level=high | Exit 0; zero vulnerabilidades. |
| npm ls braces micromatch fast-glob --all | Exit 1 esperado; saída mostra árvore vazia. |
| npm explain braces | Exit 1 esperado; “No dependencies found matching braces”. |

## Cobertura de lint

| Controle | Cobertura atual e evidência |
|---|---|
| Regras de React Hooks | eslint-plugin-react-hooks; fixture de chamada condicional falha e exhaustive-deps permanece configurada. |
| Erros TS/TSX | typescript-eslint, typecheck do projeto e fixture que exige TS2322. |
| JSX acessível | jsx-a11y; fixture sem alt e com aria inválido aciona regras. |
| Imagem e link interno Next | regra local de imagem como warning e checagem estática limitada de anchors internos; fixture negativa. |
| App Router e documentos Next | bloqueio de imports next/head e next/document; regra de script síncrono; warning para componente client async. |
| Script inline | regra de id em next/script com conteúdo inline; fixtures sem id falha e com id passa. |
| Fronteira client/server | bloqueia imports diretos de módulos protegidos, built-ins Node e acessos estáticos de env; cobre alias globalThis.process e ignora propriedades/bindings locais. |
| Componente client | a diretiva use client é reconhecida no prólogo mesmo após use strict. |

Quatorze regras especializadas do preset anterior não foram recriadas: google-font-display, google-font-preconnect, next-script-for-ga, no-before-interactive-script-outside-document, no-css-tags, no-location-assign-relative-destination, no-page-custom-font, no-styled-jsx-in-document, no-title-in-document-head, no-typos, no-unwanted-polyfillio, no-assign-module-variable, no-duplicate-head e no-script-component-in-head. A cobertura de título/head/script é parcial. O plugin faz checagens estáticas estreitas, não análise transitiva completa de imports/env. Na revisão do código, o revisor não localizou usos atuais em app/ ou src/ dos casos omitidos; isso não equivale a cobertura geral desses padrões.

## Comandos e resultados locais

As verificações abaixo foram feitas na worktree isolada da correção. Após 1ac63d1, os manifests e lockfile não mudaram; a instalação limpa hospedada foi executada novamente no SHA exato.

| Comando | Exit | Resultado |
|---|---:|---|
| npm ci --ignore-scripts --no-fund | 0 | 316 pacotes; zero vulnerabilidades; executado quando package.json e lockfile já estavam iguais ao SHA atual. |
| node --test tests/lint-config.test.mjs | 0 | 5 passaram, zero falhas ou skips; repetido após corrigir o falso positivo. |
| npm run lint | 0 | Zero erros; um aviso preexistente de CreditCard não usado em src/components/AppShell.tsx:5. |
| npm run typecheck | 0 | TypeScript concluiu. |
| npm test | 0 | 17 passaram, 1 skip por ausência de TEST_DATABASE_URL local. |
| npm run build | 0 | Build Next.js 16.4.1 concluiu. Artefatos gerados next-env.d.ts e tsconfig.tsbuildinfo foram removidos/restaurados de forma direcionada. |
| npm audit --audit-level=high | 0 | Zero vulnerabilidades. |
| npm audit --omit=dev --audit-level=high | 0 | Zero vulnerabilidades. |
| npm ls braces micromatch fast-glob --all | 1 esperado | Árvore vazia. |
| npm explain braces | 1 esperado | Nenhuma dependência braces. |
| git diff --cached --check | 0 | Sem erro de whitespace no commit de correção. |
| Gitleaks 8.30.1: git --log-opts=386bbfac..1ac63d1 --redact --no-banner | 0 | 5 commits, aproximadamente 36.20 KB, nenhum segredo encontrado. Archive Windows x64 verificado pelo SHA-256 publicado: d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e. |

## CI e revisão do HEAD de código

O HEAD 1ac63d12e6764c6aeafa778115e6bc24f749ffad concluiu os checks hospedados:

| Check | Resultado |
|---|---|
| validate — [run 38900414187](https://github.com/KayzenRoot/mktplace/actions/runs/38900414187) | SUCCESS; install limpo, lint, typecheck, testes com PostgreSQL real, build, Chromium SSR smoke/screenshots, audit completo e audit de produção. Node test registrou 20 pass, 0 fail, 0 skipped. |
| Source Pack — [run 38900414210](https://github.com/KayzenRoot/mktplace/actions/runs/38900414210) | SUCCESS. |
| SonarCloud — [PR #5](https://sonarcloud.io/dashboard?id=KayzenRoot_mktplace&pullRequest=5) | SUCCESS; Quality Gate OK, duplicação nova 0.0%, hotspots revistos 100%. |
| Socket Security: Project Report | SUCCESS. |
| Socket Security: Pull Request Alerts | SUCCESS; nenhum novo alerta de dependência. |
| CodeRabbit | “review skipped: automatic reviews are disabled”; não é parecer independente. |

O revisor independente comparou 386bbfac..1ac63d1, confirmou a correção dos falsos positivos de process, executou node --test tests/lint-config.test.mjs (5/5) e git diff --check, e não encontrou outro defeito concreto nem HIGH/CRITICAL conhecido. A confirmação final do commit documental ainda será pedida. Este parecer não substitui AC-CD05.

## Critérios de aceitação

| Critério | Estado | Evidência/limite |
|---|---|---|
| AC-CD01 — audit completo e de produção sem HIGH/CRITICAL | PASS | Ambos exits 0 e zero vulnerabilidades localmente e no CI do SHA 1ac63d1. |
| AC-CD02 — braces afetado ausente da árvore | PASS | Lockfile sem braces/micromatch/fast-glob; npm ls vazio; npm explain sem correspondência. |
| AC-CD03 — instalação, lint, typecheck, testes e build | PASS NO CI; PARCIAL LOCAL | CI exato tem 20 pass e zero skip com PostgreSQL real. A suíte local tem 1 skip por falta de TEST_DATABASE_URL; lint local tem um warning preexistente. |
| AC-CD04 — lint substituto comprovado por matriz e fixtures | PASS COM LIMITAÇÕES DOCUMENTADAS | Hooks, TS/TSX, a11y, Next/client e script inline cobertos. Quatorze regras especializadas e análise transitiva completa permanecem ausentes. |
| AC-CD05 — Compose, Docker, loopback, PostgreSQL isolado/persistência | BLOCKED | No checkout principal, a tentativa anterior de dev-check parou em docker compose build test com HTTP 500 do Docker Desktop. O docker info subsequente excedeu o timeout e foi interrompido. Na worktree isolada, dev-check parou antes do Docker porque a configuração local ignorada não tem o identificador esperado; dev-init recusou sobrescrevê-la e a deixou intacta. Nenhum container foi criado nessas tentativas; volumes existentes não foram tocados. Nenhum smoke local, Compose ou persistência é declarado aprovado. |
| AC-CD06 — CI e scanner de segredos | PASS PARA O SHA DE CÓDIGO | validate, Source Pack, Sonar e Socket passaram; Gitleaks não encontrou vazamentos no intervalo de cinco commits. |
| AC-CD07 — evidência versionada e Checkpoint Delta | PASS APÓS ESTE COMMIT | Este arquivo documenta base/HEAD de código, checks, limitações e proposta. O HEAD documental exato será informado no corpo da PR. |
| AC-CD08 — sem HIGH/CRITICAL conhecido e auditoria independente | PARCIAL | Auditor independente não encontrou defeito concreto/HIGH/CRITICAL no código em 1ac63d1; confirmação no HEAD documental pendente. AC-CD05 bloqueado impede aprovação integral da CD. |

## Limitações e riscos residuais

- AC-CD05 continua sem prova local porque Docker/Compose não pôde ser usado em um ambiente seguro e reproduzível. O CI usa PostgreSQL real e passou, mas isso não demonstra a persistência local nem o smoke de loopback pedido.
- A configuração local ignorada existente na worktree não foi lida, copiada nem sobrescrita. dev-init a preservou.
- Os 14 avisos especializados de Next listados acima não foram reimplementados. Reavaliar sua recuperação em mudança autorizada.
- CodeRabbit não revisou a PR; a revisão independente nativa não encontrou outro defeito no diff do código.
- Google/Bling/OIDC reais, HTTPS de produção, callback live, merge e deploy estão fora deste delta e não foram testados.
- O checkout principal continua com as alterações locais Auth/OAuth não commitadas; esta correção foi feita em worktree isolada. O checkout principal não foi resetado, limpo, rebaseado ou sobrescrito.

## Checkpoint Delta proposto

**Estado: PROPOSED; não aprovado nem promovido.**

1. Registrar que CD-SEC-001 removeu a cadeia vulnerável braces 3.0.3 do lockfile por substituição do preset de lint, mantendo Next/React.
2. Manter audit completo e de produção como gates no workflow.
3. Registrar regras essenciais cobertas, lacunas especializadas de lint e os links de CI/revisão ligados ao SHA correspondente.
4. Não declarar fechamento da CD nem promover checkpoint enquanto AC-CD05 estiver bloqueado e o auditor não confirmar o HEAD documental.

## Decisão de encerramento

**Veredito do executor: BLOCKED.** A vulnerabilidade de dependência está removida e o código passou nos gates automatizados; a CD-SEC-001 não recebe aprovação integral enquanto AC-CD05 não tiver evidência local e o auditor não confirmar o HEAD documental. PR #5 permanece aberta em draft. Não iniciar a continuação Auth/OAuth, não fazer merge, deploy ou avanço para WO-BLG-002.
