# Evidence Bundle — WO-BLG-001 / CD-SEC-001

**Status:** correção publicada para revisão; aprovação independente pendente. Este pacote cobre somente CD-SEC-001.

## Identificação

- Work Order: `WO-BLG-001`; delta: `CD-SEC-001`.
- PR: [#5](https://github.com/KayzenRoot/mktplace/pull/5), mantida como rascunho.
- Base da branch antes da correção: `386bbfac769cf492350751453e14f95aec97a89b`.
- Base de `main` registrada no Source Pack: `08cf0f561b5ab5b0044d31667b2321cb4446ef60`.
- Commit de implementação validado localmente: `a34cb48cc439621f80af1e12f64e72d6ad2edc9d`.
- O SHA final publicado, verificações hospedadas e parecer independente serão registrados no corpo do PR #5 após a sincronização da branch.

## Objetivo e alterações

Remover `braces@3.0.3` da árvore de dependências de desenvolvimento sem reduzir silenciosamente as verificações essenciais de lint; manter auditoria completa e de produção no workflow; disponibilizar o plugin local de lint na imagem de desenvolvimento.

Arquivos da correção:

- `.github/workflows/ui-foundation.yml`: adiciona `npm audit --audit-level=high` e mantém o audit de produção.
- `Dockerfile.dev`: copia o plugin local usado pelo ESLint.
- `eslint.config.mjs`, `scripts/eslint/mktplace-plugin.mjs`: substituem a configuração dependente de `eslint-config-next` e definem regras locais de React, Hooks, acessibilidade e limites do App Router.
- `package.json`, `package-lock.json`: removem a cadeia que incluía `eslint-config-next` e adicionam dependências diretas para a configuração substituta.
- `tests/lint-config.test.mjs`: verifica severidades, violações negativas de Hooks/acessibilidade/TypeScript/Next e limites de módulos/env no cliente.

Nenhum arquivo de implementação Auth/OAuth foi incluído.

## Critérios de aceitação

| Critério | Resultado observado |
|---|---|
| Audit completo e de produção sem vulnerabilidades HIGH ou CRITICAL | **PASSOU localmente**; ambos reportaram zero vulnerabilidades. Actions no SHA final ainda pendente. |
| `braces` ausente da árvore instalada | **PASSOU localmente**; `npm ls braces --all` mostrou `(empty)` e `npm explain braces` não encontrou dependência. |
| Instalação limpa, lint, typecheck, testes e build | **PARCIAL**; instalação, lint, typecheck e build passaram. `npm test` passou com 17 testes e 1 skip porque este ambiente não fornece `TEST_DATABASE_URL`; os testes PostgreSQL sem skip dependem do gate hospedado. Fixtures de lint passaram 5/5. |
| Testes com PostgreSQL e verificações Docker locais | **BLOQUEADO pelo ambiente**; o daemon Docker Desktop respondeu HTTP 500 em `/_ping` e `/version`. `scripts/dev-check.ps1` parou em `docker compose build test`, antes de criar containers. A imagem `Dockerfile.dev`, smoke local e persistência não foram validados nesta sessão. |
| Gitleaks e integridade do diff | **PASSOU localmente**; Gitleaks 8.30.1 reportou `no leaks found`; `git diff --cached --check` passou. |
| CI hospedado e revisão independente do SHA final | **PENDENTE**. |

## Comandos e resultados locais

| Comando | Resultado |
|---|---|
| `npm ci --ignore-scripts --no-fund` | exit 0; 316 pacotes; zero vulnerabilidades. |
| `npm audit --audit-level=high` | exit 0; `found 0 vulnerabilities`. |
| `npm audit --omit=dev --audit-level=high` | exit 0; `found 0 vulnerabilities`. |
| `npm ls braces --all` | exit 1 esperado; árvore vazia. |
| `npm explain braces` | exit 1 esperado; nenhuma dependência `braces`. |
| `npm run lint` | exit 0; 0 erros e 1 aviso (`CreditCard` não usado em `src/components/AppShell.tsx:5`). |
| `npm run typecheck` | exit 0. |
| `npm test` | exit 0; 17 passaram, 1 skip por ausência de `TEST_DATABASE_URL`. |
| `node --test tests/lint-config.test.mjs` | exit 0; 5 passaram, 0 falhas/skip. |
| `npm run build` | exit 0; build Next.js 16.4.1 concluído. |
| `gitleaks protect --staged --redact` | exit 0; 20.72 KB examinados, nenhum segredo detectado. Arquivo oficial v8.30.1 verificado por SHA-256 `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`. |
| `git diff --cached --check` | exit 0. |
| `scripts/dev-check.ps1` | exit 1 antes de iniciar containers; erro HTTP 500 do daemon em `/_ping`. |

## Riscos e limitações

A configuração mantém explicitamente Hooks, React, TypeScript, acessibilidade JSX, imagens, links internos, limites App Router e prevenção de imports/env de servidor em componentes cliente. Algumas regras antigas de `eslint-config-next` não foram recriadas; entre elas verificações de Google Fonts, CSS tags, polyfill.io, typos e casos especiais de `<Script>`/`<Head>`. `no-title-in-document-head` e `no-duplicate-head` têm cobertura local apenas parcial. A revisão independente deve decidir se essa cobertura atende o requisito de preservar o lint relevante; não há aprovação presumida.

O teste local PostgreSQL, Dockerfile de desenvolvimento, Compose, smoke local e persistência permanecem sem evidência atual por indisponibilidade do daemon. A Action do PR cobre PostgreSQL real, lint, typecheck, testes, build, smoke visual e os dois audits, mas não substitui os gates de persistência local.

## Checkpoint Delta proposto — PROPOSED

1. Retirar `eslint-config-next` e sua cadeia transitiva vulnerável do ambiente de desenvolvimento.
2. Manter uma configuração ESLint explícita com regras de lint testadas e uma regra local para dependências de lint.
3. Exigir audit npm completo e de produção no workflow do PR.
4. Copiar o plugin local para a imagem de desenvolvimento.
5. Não promover o checkpoint enquanto os gates hospedados do SHA final e o parecer independente não forem concluídos; resolver qualquer lacuna de lint apontada e repetir as validações no SHA corrigido.
