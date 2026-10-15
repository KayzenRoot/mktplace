# UI / UX
## Personas e objetivos
Proprietário não técnico acessa de qualquer lugar por celular ou desktop. Fluxo reduzido, controle visível, sem expor segredos.
## Páginas WO-001
- `/login`: login com provedor confiável, mensagens de acesso restrito.
- `/settings/integrations`: cartão Bling com estados Não conectado, Conectando, Conectado, Reautenticação necessária, Falha de revogação; botões Conectar, Testar conexão, Reconectar e Desconectar.
- `/dashboard`: página inicial mínima com status, sem dados comerciais fictícios confundíveis com dados reais.
## Estados e acessibilidade
Feedback de loading e erro acionável; foco teclado, mensagens aria-live; contraste AA como meta; pt-BR (datas America/Sao_Paulo); nenhum botão destrutivo sem confirmação.
## Futuro
Menu lateral Dashboard, Produtos, Estoque, Pedidos, Notas, Financeiro, Relatórios, Configurações; KPIs com período e informação 'última sincronização'; banner 'dados desatualizados' se falha.
## Design
Mobile first e simples, com tabelas paginadas quando existirem; nunca mostrar JWT, Client Secret, refresh ou conteúdo fiscal em observabilidade pública.

## Mapa de navegação objetivo
Dashboard • Produtos • Fornecedores (BeHot) • Estúdio IA (títulos/descrições/imagens) • Anúncios (ML/Shopee/Amazon) • Disponibilidade/Estoque sob demanda • Pedidos/Expedição • Fiscal • Financeiro • Clientes • Relatórios/Alertas • Configurações (Bling, fornecedor, LLM, imagens, margens, permissões, sincronizações) • Sistema/Auditoria.
Primeiro **Design System + layout responsivo + navegação** com fixture DEMO e feature flags. Telas reais passam a exibir source/last_sync, loading/error/stale e bloqueios; botão `Publicar` apenas quando permissão Bling, política de canal, cadastro validado e owner confirmado.
Detalhes em `20-MODULE-MAP.md` e `21-FRONTEND-FIRST-DELIVERY.md`.
