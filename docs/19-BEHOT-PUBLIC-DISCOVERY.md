# BeHot | Preflight do catálogo público
**Data do levantamento:** 2026-10-15
**Estado:** ANALYZED_PUBLIC_ONLY / PROPOSED DOC UPDATE; sem login e sem scraping em produção
**Fornecedor informado pelo Owner:** `https://behot.com.br`
**URL canônica acessível nas fontes públicas:** `https://www.behot.com.br/`

## Evidência pública observada
| Sinal | Observação | Referência |
| --- | --- | --- |
| Identidade | Site identificado como Distribuidora BeHot | https://www.behot.com.br/ |
| Listagem | Produtos em `/produtos/`, múltiplas páginas e categorias; na consulta havia indicação de aprox. 52 páginas (quantidade variável) | https://www.behot.com.br/produtos/ |
| Preço | Preços regulares/promocionais e para Pix aparecem publicamente; preço efetivo para conta B2B pode diferir | https://www.behot.com.br/produtos/ |
| Disponibilidade | Site mostra 'Esgotado' em cards e 'Atenção, última peça!' em ao menos uma página individual; são sinais pontuais, não garantem estoque real ou precisão histórica | https://www.behot.com.br/ ; https://www.behot.com.br/produtos/sache-int-loob/ |
| Login | `/account/login/` mostra e-mail/senha, fluxo de recuperação de senha e aviso de muitas tentativas | https://www.behot.com.br/account/login/ |
| Variações | Lista possui produtos com escolhas de variante como modelos, aromas ou cores; matching por nome isolado é insuficiente | https://www.behot.com.br/ |

## NÃO confirmado
- Acesso à conta do Owner, comportamento real de login, MFA/CAPTCHA, cookies ou restrições pós-login. **Não houve tentativa de autenticação**.
- Quantidade exata de unidades por SKU, identificadores internos ou EAN publicados de forma consistente; páginas observadas não exibem SKU universal visível.
- Permissão contratual para scraping sistemático, termos específicos e robots.txt (a tentativa de consulta não retornou conteúdo legível para confirmar política).
- API/feed/CSV oficial fornecido pela BeHot para parceiros. Ausência de API visível ao comprador **não prova inexistência**.
- Plataforma de e-commerce e possíveis APIs de proprietário: aparências/rotas não bastam para estabelecer Nuvemshop. API de administrador de loja, se existente, exige consentimento do dono e não decorre de conta de comprador.

## Proposta de engenharia (não implementada)
1. Submeter catálogo público a preflight de autorização/termos e limites; se viável, prototipar coletor **read-only** das páginas públicas sem login, com fixtures e rate limiting. Escalada para Playwright somente quando necessária para renderização.
2. Extrair campos comprováveis `supplier_url`, `product_name`, `variant`, `listed_price`, `availability_hint`, `observed_at`, `confidence`; qualquer item sem sinal confiável = `unknown`.
3. Confirmar disponibilidade de SKU/variante e preços reais com owner em navegação legítima autenticada e/ou perguntar ao fornecedor sobre exportação CSV/API/feed consentida. Segredos exclusivamente no cofre do ambiente e nunca na PR pública.
4. Mapear explicitamente `supplier_variant` para `bling_sku`; divergências geram aprovação manual; falha de coleta não zera saldo do Bling.
5. Somente após WOs atuais aprovadas e políticas de writeback auditadas, adicionar atualização de disponibilidade comercial usando Bling API v3; não confundir disponibilidade BeHot e estoque físico próprio.
6. Considerar restrições de políticas por categoria nos canais de marketplace ao publicar produtos, sem presumir elegibilidade automática.

## Verificações para futuras evidências
- Parser de páginas indexadas e paginadas, casos de produto esgotado/última unidade, opções de variantes, produto removido/404, campos ausentes, preços promocionais, mudanças estruturais, respostas 429/403, stop em desafio e jitter.
- Teste de correspondência SKU, persistência de último status confiável, freshness e ausência de falso `0` em falhas.
- Licença, terms/robots e autorização expressa para automação, especialmente área de login, validadas e registradas no PR específico.
- Guardrails de segredo: nenhum cookie/senha/HTML privado em GitHub público, logs, screenshot, cache ou artifacts.

## Fonte oficial Bling
https://developer.bling.com.br/aplicativos

## STOP
Somente descoberta pública documentada nesta revisão. NÃO executar scraping recorrente, fazer login no fornecedor, pedir/usar senhas ou alterar Bling. A WO-BLG-001 continua focada em conexão OAuth do Bling.

## Evidência adicional fornecida pelo Owner (2026-10-15)
Screenshot de sessão autenticada na página de `Massageador Peridell Pink`: preço anunciado R$178,63, Pix R$151,84, 3x R$59,54, 15% de desconto Pix, campo `QUANTIDADE` inicialmente com `1` e botão `COMPRAR` ativo.
**Interpretação segura:** `QUANTIDADE=1` indica seleção para compra, não inventário. `COMPRAR` ativo é sinal plausível de oferta, não confirmação de que há mais unidades nem garantia de cumprimento no momento da futura venda. O portal não mostra saldo absoluto nesta evidência.
**Privacidade:** screenshot **não publicada** no repo, pois inclui dados incidentais de navegação pessoal. Apenas campos comerciais mínimos acima foram transcritos.
**Necessidade:** captar mudança de ofertabilidade, não descobrir quantidades; comercializar sob demanda e retirar no mesmo dia. Definição formal em ADR-011 / `18-SUPPLIER-MONITORING.md`.
