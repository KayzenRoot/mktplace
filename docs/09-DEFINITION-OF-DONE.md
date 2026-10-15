# Definition of Done
## Para o Source Pack / BLG-BOOT-001
Todos os documentos obrigatórios presentes, vinculados por hierarquia; requisitos rastreados; riscos declarados; ADRs e checkpoint marcados como PROPOSED, não ficticiamente APPROVED; PR documental revisada e integrada.
## Para WO-BLG-001
1. Login proprietário OIDC com acesso negado a terceiros, MFA externamente verificado.
2. OAuth callback seguro com state single-use e troca imediata em backend; JWT Bling com header obrigatório.
3. Tokens persistidos criptografados e refresh com controle de concorrência; erros/invalid_grant explícitos.
4. GET read-only autorizado funcionando via mock; live smoke com autorização real **se infraestrutura/credenciais disponíveis**, sem mascarar a ausência como sucesso.
5. Desconexão segura, comportamento de revogação correto e observável.
6. Unidade, integração, E2E, CSRF/replay, lint, types, build, dependências e segurança passando.
7. Evidence Bundle verificável contra SHA base/head e PR, resultados reais, riscos e observações.
8. Ambiente web HTTPS implantado, auth e conexão real testados; se ausente, WO permanece BLOCKED para conclusão de versão, mesmo com CI verde.
9. Auditor independente registra APPROVED sem defeitos HIGH/CRITICAL; checkpoint promovido só após auditoria.
## Para versão de negócio futura
Produtos, vendas, estoque, notas e financeiro implementados, reconciliáveis e validados com dados reais autorizados, respeito ao escopo das WOs.
## Gates
CORRECTION REQUIRED -> somente Correction Delta no mesmo PR; BLOCKED -> não avançar; APPROVED -> atualizar docs/mergir protegidamente.

## Supplier Monitor (WO-BLG-009, etapa futura)
Contrato/site específico revisado; coleta permitida; login/sessão por cofre; nenhuma credencial no repo/CI; fixtures de login e HTML; mapeamentos inequívocos; estados unknown/unavailable separados; evidências de execução sem PII. Operação comercial permanece apenas leitura nesta WO.
## Sync fornecedor -> Bling (WO-BLG-010, futura)
Exigir catálogo estável, política escrita aprovada, comparação de SKUs/variantes, preview/dry-run, confirmação de proprietario ou regra explicitamente autorizada, atualização idempotente, rollback/reconciliação, logs não sensíveis e nenhuma alteração em estoque físico devido a ausência de dados do fornecedor.

## Validação específica da venda sem estoque físico
Sem evidência explícita de suporte e testes de campo virtual separado no Bling + marketplace, bloquear qualquer sincronização de quantidade; exigir estratégia alternativa autorizada. Para cada SKU/variante: sinal atual com timestamp e confidence, política de exposição <=1 proposta, parada ante stale/error, reserva pós-venda, revisão manual de indisponibilidade, economicidade validada e compliance por canal. Não afirmar prevenção total de oversell sem confirmação de sincronização multicanal.

## Requisitos de negócio de V1 futura
Painel opera produtos/anúncios/pedidos/financeiro/fiscal via Bling real, sem acesso direto obrigatório aos marketplaces no uso cotidiano; dados reproduzem fonte com last-sync e erros; elegibilidade legal/políticas aprovada por canal; IA gera drafts verificáveis, imagens fiéis licenciadas; BeHot sinaliza disponibilidade com TTL; writebacks só quando comprovados e auditados. Produtos vetados não são publicados; execução multicanal testada com status real.
## Frontend-first e paralelismo
Mock UI pode estar visualmente pronto, mas **não conta como conexão real, feature ou DoD**. Agentes paralelos entregam resultado integrado no head final e todos os checks; PR não avança com defect HIGH/CRITICAL. Nenhum checkpoint promovido por executor.
