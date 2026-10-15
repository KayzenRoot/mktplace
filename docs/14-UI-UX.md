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
