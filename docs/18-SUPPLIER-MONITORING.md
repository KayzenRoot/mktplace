
# Supplier Monitor | Integração de fornecedor sem API
**Data:** 2026-10-15 | **Classificação:** IMPORTANT após WO-BLG-002 | **Status:** PROPOSED; nenhuma coleta executada

## Contexto da operação
Proprietário compra catálogo de um fornecedor pela internet e retira pessoalmente. O portal possui usuário e senha, porém não foi identificada API. Queremos observar disponibilidade e eventualmente refletir situação comercial no Bling, **não** assumir que produtos do fornecedor estão fisicamente em nosso depósito.

**Dependências não recebidas:** URL/domínio público do fornecedor, termos e autorização de automação, página catálogo/login, presença de 2FA/CAPTCHA e relação de SKUs/variantes. Não pedir nem armazenar login/senha no chat.

## Modo de operação planejado
1. Proprietário configura fornecedor no painel (domínio HTTPS permitido, identidade da conta no cofre, frequência e consentimento de acesso).
2. Na WO-BLG-009, worker isolado abre navegador Playwright, faz login legítimo ou reutiliza sessão cifrada de armazenamento privado, respeitando desafios interativos e proibição de contorná-los.
3. Consulta lista permitida de produtos/variantes (preferência para feed/CSV/export oficial se existir), registra código externo, preço, status disponível/indisponível/desconhecido, eventual quantidade **somente quando explicitamente publicada**, URL permitida, time observed.
4. Normaliza snapshots e compara com histórico; mapeia SKU de fornecedor para SKU Bling, com aprovação manual de exceções.
5. Painel fornece `Fornecedor disponível`, `Última consulta`, `Confiança`, `Divergências`, `Alterações propostas`; nunca apresentar disponibilidade como saldo em mãos.
6. WO-BLG-010 somente após mecanismo de writeback aprovado: gera prévia, requer aprovação das regras, aplica alterações comerciais *permitidas* na API Bling, registra resultado e valida reconciliação. Por padrão não mexer em saldo próprio, emissão fiscal nem preço sem regra explícita.
7. Ao encontrar erro de login, bloqueio, CAPTCHA, MFA, mudança HTML, limite 403/429, parar/colocar sinal `unknown`, informar owner. Nunca transformar falha de leitura em 'acabou estoque'.

## Scheduler
Cadência inicial **sugerida**: a cada 4 horas, com backoff e jitter (configurável após análise dos termos e carga do site), request rate gentil e cache. Github Actions `schedule` pode ser protótipo econômico, mas não oferece SLA e pode parar por inatividade pública após 60 dias; separar scheduler de UI. Se monitor precisa de alta confiabilidade, migrar scheduler para processo gerenciado.
O workflow público de CI para PR nunca recebe credenciais nem cookies reais. Job autenticado roda somente em código da branch de confiança, com secrets restritos e `GITHUB_TOKEN` de leitura mínima, logs/artefatos saneados.

## Segurança e permissão
Autenticar somente com conta do próprio proprietário e autorização compatível com os termos do portal. Não contornar CAPTCHA, MFA, rate limits, bloqueios ou medidas anti-bot. Nunca publicar fornecedor credenciais/HTML privado em GitHub, issue, logs, Actions artifact, screenshots, trace ou chat. Preferir secret manager do host; Playwright `storageState` é segredo tão sensível quanto cookie de sessão. Rotação de senha e re-login interativo quando necessário.
Não presumir que acesso a portal confere permissão para coletar dados em escala; a verificação de termos e boa-fé é critério preflight. Também não requisitar dados pessoais de clientes nem checkout.

## Semântica de estoque
`physical_stock`: somente itens sob controle/posse da loja, fonte oficial Bling.
`supplier_available`: sinal de possibilidade de compra/retirada, não quantidade própria.
`sellable_virtual_stock` (opcional FUTURE): calculado só após política explícita de prazo/cancelamento/reserva e validação de compatibilidade com canais de venda.
`unknown` vs `unavailable`: erro, login expirado ou página alterada = unknown e preserva último snapshot válido como histórico, mas sinaliza staleness.
O sistema deve suportar fornecedor com múltiplas variantes e SKU distintos; não vincular produtos pelo nome sozinho.

## Preflight para futura WO-BLG-009
- Identificar URL pública e termos/licença/robots/rate policy; pedir permissão explícita do fornecedor quando necessário.
- Auditar login (MFA/captcha/CSRF) e verificar se existe exportação, catálogo, feed ou API não anunciada.
- Obter amostras **sanitizadas**, produzidas por acesso autorizado do Owner, e determinar mapeamento SKU/variante.
- Definir limites (domínio, páginas, max requests, frequência) antes de ativar coleta; separar dev e produção.
- Escolher secret manager/ambiente que evite expor credenciais em repositório público.

## Acceptance Gates sugeridos
**WO-BLG-009:** login autorizado, scraping confiável com fixtures, zero secrets no código/logs/CI, política do site verificada, DOM-change testes, estados unknown corretos, evidência mínima e relatórios read-only, revisão independente.
**WO-BLG-010:** adapter Bling aprovado, mapeamento completo, dry-run, review de risco por preço/saldo/marketplace, idempotência e reconciliação; nenhum erro de coleta escreve saldo zero. Somente executar após dependências APPROVED.

## Referências
- GitHub Actions billing (standard runners public free): https://docs.github.com/en/billing/concepts/product-billing/github-actions
- GitHub schedule inactivity caveat: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
- Playwright auth state security: https://playwright.dev/docs/auth
- Bling API v3: https://developer.bling.com.br/bling-api
