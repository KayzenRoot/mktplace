# Requirements
## Funcionais
- **RF-001 [NECESSARY WO-001]** Login seguro do proprietário e negação total a não autorizados.
- **RF-002 [NECESSARY WO-001]** Iniciar OAuth 2.0 Authorization Code com state único, vinculado à sessão e expiração.
- **RF-003 [NECESSARY WO-001]** Receber callback, validar state, trocar code uma única vez no backend e armazenar tokens cifrados.
- **RF-004 [NECESSARY WO-001]** Renovar credenciais em segurança, serializar refresh e sinalizar reconexão.
- **RF-005 [NECESSARY WO-001]** Consultar recurso read-only autorizado e mostrar conexão saudável, sem payload pessoal nos logs.
- **RF-006 [NECESSARY WO-001]** Desconectar/revogar com confirmação, status correto e sem expor segredo.
- **RF-007 [IMPORTANT futuro]** Listar produtos, preços, SKUs, custos e estoque.
- **RF-008 [IMPORTANT futuro]** Listar pedidos e origens da venda, com filtros.
- **RF-009 [IMPORTANT futuro]** Consultar notas e situações fiscais; sem emissão/cancelamento automático.
- **RF-010 [IMPORTANT futuro]** Consultar contas a pagar e receber, vencimentos e totalizações.
- **RF-011 [IMPORTANT futuro]** Sincronizar por paginação, webhooks e reconciliação sem duplicatas.
- **RF-012 [FUTURE]** Escritas autorizadas com preview, confirmação, trilha e recuperação.
- **RF-013 [FUTURE]** Alertas, relatórios e IA assistiva.
## Não funcionais
- **RNF-001** TLS obrigatório; sessão segura; 2FA no provedor de identidade; allowlist de proprietário.
- **RNF-002** Client Secret/refresh/access token exclusivamente no servidor, criptografia autenticada em repouso, sem envio ao browser.
- **RNF-003** 0 vazamentos de credenciais em logs, resposta, commit ou CI; rotação documentada.
- **RNF-004** Respeitar limite Bling (3/s, 120k/dia), proteger endpoint de tokens (20 requisições/60s por IP conforme documentação) e backoff em 429.
- **RNF-005** IDs e empresa vinculada verificados antes de qualquer futura escrita; single-company como invariante.
- **RNF-006** Timestamps UTC no banco; apresentação pt-BR e America/Sao_Paulo; valores monetários DECIMAL.
- **RNF-007** Sem promessa de disponibilidade até testes em ambiente de produção; observabilidade com metadados não sensíveis.
## Origem
Requisitos de negócio: solicitação do proprietário (2026-10-15). Contratos externos: documentação oficial do Bling indicada em `15-INTEGRATION-CONTRACTS.md`.
