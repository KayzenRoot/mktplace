
# Supplier Monitor | Integração de fornecedor sem API
**Data:** 2026-10-15 | **Classificação:** IMPORTANT após WO-BLG-002 | **Status:** PROPOSED; nenhuma coleta executada

## Contexto da operação
Proprietário compra catálogo de um fornecedor pela internet e retira pessoalmente. O portal possui usuário e senha, porém não foi identificada API. Queremos observar disponibilidade e eventualmente refletir situação comercial no Bling, **não** assumir que produtos do fornecedor estão fisicamente em nosso depósito.

**Fornecedor identificado:** Distribuidora BeHot, `https://www.behot.com.br/`. Login público identificado em `/account/login/` com campos e-mail/senha. Catálogo em `/produtos/`, com paginação e sinalização de disponibilidade. Nenhuma sessão autenticada executada.

**Dependências ainda ausentes:** termos/autorização de coleta, formato real de SKU/variante, eventual preço diferenciado pós-login, MFA/CAPTCHA e existência de exportação/integração autorizada. Não pedir nem armazenar login/senha no chat. Consulte `19-BEHOT-PUBLIC-DISCOVERY.md` para observações e fontes.

## Modo de operação planejado
1. **Preferir leitura do catálogo público autorizado antes do login.** Proprietário configura fornecedor no painel (domínio HTTPS permitido, identidade da conta no cofre se necessária, frequência e consentimento de acesso). Só usar sessão autenticada se permitir dados realmente necessários e houver condições para uso automatizado.
2. Na WO-BLG-009, adapter extrai páginas públicas permitidas com HTML leve quando possível; usar Playwright isolado só se renderização JS exigir. Para páginas privadas e após autorização, login legítimo ou sessão cifrada; respeitar desafios interativos e proibição de contorná-los.
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
- URL identificada: `https://www.behot.com.br/`. Ainda verificar termos/licença/robots/rate policy; não interpretar falha de leitura de `robots.txt` como permissão irrestrita; pedir autorização explícita se necessário.
- Login público identificado em `https://www.behot.com.br/account/login/`. Auditar com autorização e sessão local (MFA/captcha/CSRF) quando chegar sua WO. Verificar com fornecedor exportação de catálogo/CSV e possibilidade de feed/API B2B sob permissão; API do provedor da loja NÃO é automaticamente acessível ao comprador.
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

## Fonte específica BeHot
Análise de conteúdo público em 2026-10-15 documentada em [`19-BEHOT-PUBLIC-DISCOVERY.md`](./19-BEHOT-PUBLIC-DISCOVERY.md). Sinais como 'última peça' ou 'esgotado' refletem momento da página e não SLA, reserva confirmada, quantidade confiável nem atualização em tempo real.

## Descoberta de operação comercial (foto autenticada, 2026-10-15)
O proprietário confirmou operação de venda **sob demanda**, com possibilidade de compra online e retirada local no mesmo dia. Seu objetivo não é gerir quantidade real da BeHot (ela não aparece), e sim manter catálogo ofertável enquanto há sinal de disponibilidade.
Foto recebida **não foi armazenada no GitHub**. Exibe como exemplo Massageador Peridell Pink, preço R$178,63, preço Pix R$151,84, três parcelas de R$59,54, botão `COMPRAR` visível e campo de seleção `QUANTIDADE=1` por padrão. Esse número é quantidade solicitada pelo comprador e **não representa estoque do fornecedor**. Tampouco prova reserva ou estoque ilimitado. Preços e disponibilidade variam.
### Política para publicação futura
- Primeiro monitorar produto/variante e disponibilidade; não inferir estoque pela mera existência do botão (ele é sinal a validar).
- Proposta conservadora **no máximo 1 unidade virtual por SKU/variante** para vendas simultâneas, apenas se mecanismo oficial Bling/canais aceitar a semântica comercial sem adulterar o saldo físico; não lançar `1` como estoque próprio.
- Ao receber pedido, registrar hold e iniciar processo de compra/retirada no fornecedor; pausar/reconciliar anúncio até nova verificação. Sincronização Bling-marketplaces é eventualmente consistente e pode permitir pedidos concorrentes; não há garantia absoluta.
- Em indisponibilidade confirmada, pausar anúncio/oferta; em falha de consulta ou snapshot vencido, usar modo seguro conforme política aprovada e alertar, sem declarar saldo físico zero.
- Antes de publicar anúncios, verificar políticas de cada marketplace para itens de categoria adulta; cada canal tem regras próprias.
- Preço final ao comprador deve considerar preço BeHot aplicável à modalidade de pagamento, taxas dos canais, impostos, logística/retirada e margem; parcela e desconto Pix não são automaticamente preço de custo garantido.
- Frequência proposta: coleta geral a cada 4h e, se permitida, priorização de produtos ofertados a cada 60 min. Retirada no mesmo dia é capacidade do proprietário, não garantia contratual de reposição do fornecedor.
### Dependências de aceite
Confirmar o que acontece quando produto esgota (sinal específico por variante), publicação de quantidade virtual sem efeitos contábeis, SLA operacional e como tratar duas vendas quase simultâneas.
