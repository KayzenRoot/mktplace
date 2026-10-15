# Desenvolvimento local com Docker

Este fluxo prepara o MKTPlace para desenvolvimento em Windows com Docker Desktop. O app usa Node.js 22 e Next.js; o PostgreSQL de desenvolvimento fica somente na rede interna do Compose. Nenhum valor de credencial local deve ser versionado ou copiado para o chat.

## Preparar e iniciar

Execute na raiz do repositório:

```powershell
.\scripts\dev-init.ps1
.\scripts\dev-up.ps1
.\scripts\dev-status.ps1
```

`dev-init.ps1` cria `.env.docker.local` com identificador de instância e credenciais aleatórias para o banco local. Ele não imprime os valores. O arquivo é ignorado pelo Git; `.env.docker.local.example` é apenas um modelo e não deve ser usado como arquivo de execução.

`dev-up.ps1` constrói a imagem de desenvolvimento e inicia app e PostgreSQL. O app é publicado somente em `127.0.0.1`; a porta inicial é 3000. Se ela estiver ocupada, o script escolhe outra porta local disponível e informa a URL. Em uma nova execução, conserva a porta publicada pelo app que já está ativo. O banco não publica porta no host.

O app é uma demonstração sem dados reais e sem conexão OAuth. Não defina `ALLOW_PUBLIC_DEMO=true` para este fluxo. O app conecta ao banco pela rede privada do Compose; a rede de saída do app permanece habilitada para dependências de desenvolvimento.

## Migração, validação e parada

```powershell
.\scripts\dev-migrate.ps1
.\scripts\dev-check.ps1
.\scripts\dev-status.ps1
.\scripts\dev-down.ps1
```

`dev-migrate.ps1` aplica a migração idempotente somente ao banco de desenvolvimento desta instância e imprime nomes de tabelas, não dados. `dev-check.ps1` cria um projeto Compose temporário e um PostgreSQL de teste em `tmpfs`, executa `npm run check` (lint, typecheck, testes e build) e remove somente os recursos temporários desse projeto. Não use volumes persistentes no banco de teste.

`dev-down.ps1` para os serviços do projeto e preserva containers e volumes nomeados, incluindo o banco local. Para continuar, execute `dev-up.ps1` novamente. Não use `docker compose down -v` neste fluxo.

`sync-github.ps1` verifica o remote e a branch configurados, busca atualizações e só integra avanço por `pull --ff-only`. Ele não faz push. Não use o script para trocar de branch ou atualizar o checkpoint canônico.

## Fast Refresh no Docker Desktop para Windows

O bind mount de arquivos Windows pode atrasar ou perder eventos de alteração no Docker Desktop. Por isso o serviço `app` inicia Next.js com Webpack e `WATCHPACK_POLLING=true`; o build de produção e os scripts npm do repositório continuam usando a configuração normal do projeto. Polling pode aumentar o uso de CPU e I/O. Para melhor desempenho, use um checkout dentro do sistema de arquivos Linux do WSL2 ou avalie Docker Desktop synchronized file shares. A documentação do Next.js descreve essa limitação e recomenda considerar desenvolvimento fora do Docker para melhor desempenho: [ambiente local do Next.js](https://nextjs.org/docs/app/guides/local-development). O modo Webpack é uma opção oficial do CLI: [Next CLI](https://nextjs.org/docs/app/api-reference/cli/next).

## Isolamento e segurança

- Os nomes de projeto e o volume PostgreSQL são únicos por instância; o volume de desenvolvimento persiste ao parar e iniciar.
- O app escuta em loopback. O PostgreSQL não tem porta publicada no host.
- O banco de teste usa outra rede interna e armazenamento temporário `tmpfs`.
- `.dockerignore` e os mounts impedem copiar ou montar o arquivo local de ambiente dentro do app.
- A imagem instala dependências com `npm ci --ignore-scripts`; segredos de OAuth reais não são necessários nem usados.
- Nunca inclua `.env.docker.local`, senhas, tokens ou credenciais em commits, logs ou evidências.
