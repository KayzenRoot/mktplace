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
