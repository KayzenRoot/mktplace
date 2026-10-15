# MKTPlace | Bling Hub
Aplicativo web de acesso privado com repositório público, single-company, para acompanhar a operação comercial e fiscal a partir do Bling API v3.

**Situação (2026-10-15):** documentação proposta em PR; implementação NÃO iniciada, integração real NÃO validada, deploy NÃO realizado. Não confundir especificação com entrega.

## Fonte da verdade
Ordem: Checkpoint > Decisions Ledger/ADRs > Scope > Definition of Done > Architecture > Requirements > demais documentos.
Para decisões aprovadas, evidências de código/CI/Git prevalecem sobre narrativas. Mudanças relevantes exigem ADR e checkpoint atualizado somente após auditoria.
O documento `docs/00-SOURCE-HIERARCHY.md` é o índice canônico.

## Versão e objetivo
Planejamento `0.1.0-draft`, primeira versão técnica voltada a conectar o próprio proprietário à API v3 do Bling com segurança.
Produto completo é incremental: conexão segura -> leituras -> sincronização -> gerenciamento com controles -> automações.
Nenhuma ação fiscal ou financeira irreversível ocorrerá automaticamente.

**Integração futura aprovada para planejamento:** monitorar catálogo/disponibilidade de fornecedor externo via navegação autenticada autorizada (Playwright) e conciliar com catálogo Bling. Disponibilidade externa **não é estoque físico próprio**. Sem coleta ou publicação automática na WO-BLG-001. Detalhes em `docs/18-SUPPLIER-MONITORING.md`.

## Organização
- `docs/`: Source Pack, arquitetura, contratos, aceites, operações e decisões.
- `work-orders/WO-BLG-001.md`: primeiro incremento implementável após aprovação do Source Pack.
- `src/`: implementação futura; **ainda não existe**.
- `.env.example`: nomes de variáveis previstos sem credenciais reais.

## Uso e segurança
Repositório **público por decisão expressa do proprietário** para aproveitar CI/Actions em runners padrão. Não inserir Client Secret, tokens, CPF/CNPJ, dados de clientes, XML fiscal, bancos, dumps ou prints pessoais.
O painel exige autenticação e autoriza exclusivamente proprietário; Bling é fonte oficial de verdade.
Documentos oficiais consultados: https://developer.bling.com.br/aplicativos ; https://developer.bling.com.br/migracao-jwt ; https://developer.bling.com.br/limites ; https://developer.bling.com.br/referencia ; https://developer.bling.com.br/webhooks .

## Próximo passo
Auditar e aprovar a PR documental. Só então executar WO-BLG-001 em branch própria, testar, fazer PR e auditar.

## Nova visão funcional confirmada pelo Owner (2026-10-15)
MKTPlace é o cockpit web de operação via Bling para Mercado Livre, Shopee e Amazon, incluindo fornecedor BeHot, enriquecimento de cadastro por IA (texto/imagem) e visualização de pedidos, financeiro, fiscal e logística. Veja [Mapa de Módulos](docs/20-MODULE-MAP.md), [Estratégia visual-first](docs/21-FRONTEND-FIRST-DELIVERY.md), [IA providers](docs/22-AI-PROVIDER-CONTRACTS.md), [Políticas marketplaces](docs/23-MARKETPLACE-ELIGIBILITY.md) e [Agentes](docs/24-MULTI-AGENT-PLAN.md).
A prioridade visual **não elimina** auth ou segredos; mocks são identificados como DEMO. Bling API v3 documenta criação/publicação/pausa de anúncios, mas integração por canal, políticas e permissões devem ser validadas antes de execução real. Fonte: https://developer.bling.com.br/referencia
