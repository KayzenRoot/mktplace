
# Marketplaces | política por produto e fonte oficial
**Estado:** análise pública 2026-10-15; não é aprovação para todos os SKUs/canais.
## Mercado Livre
Termos de categoria Adultos exigem usuário maior de 18 anos e colocam responsabilidade e restrições específicas sobre publicação e material. Categoria existe, mas produtos específicos podem ser vetados ou requerer condições.
Fonte: https://lista.mercadolivre.com.br/adultsTermsAndConditions
## Amazon Brasil
Seller Central possui políticas para produtos adultos; referências de moderação reconhecem brinquedos sexuais sob condições e apresentação não explícita, categoria apropriada. A aceitação pode variar por produto, atributos, imagens e conta.
Fontes: https://sellercentral.amazon.com.br/help/hub/reference/external/G200339940 ; https://sellercentral.amazon.com.br/seller-forums/discussions/t/2f12438a-c842-4eb4-8df9-52f58d44bf35?postId=2f12438a-c842-4eb4-8df9-52f58d44bf35
## Shopee
Não confundir **Shopee Video** (regras específicas e claras contra várias demonstrações sexuais) com listagem regular no Seller Center. As diretrizes gerais restringem conteúdo sexual/nudez e citam brinquedos; a política de venda do produto em anúncio padrão precisa de confirmação pelo catálogo de produtos proibidos/restritos do seller e respostas oficiais, por SKU/categoria.
Fontes: https://help.shopee.com.br/4/article/150027-Diretrizes-da-Comunidade-Shopee ; https://help.shopee.com.br/portal/10/article/188364-Pol%C3%ADtica-de-Produtos-Proibidos-e-Restritos-na-Shopee-Video
## Gate de canal (todas as lojas)
`UNVERIFIED` -> `ELIGIBLE` ou `RESTRICTED` ou `PROHIBITED`. Bloquear publicar em `UNVERIFIED/PROHIBITED`; em `RESTRICTED`, exigir condições satisfeitas e evidência datada. Exigir SKU/EAN e atributos necessários, origem/licença de imagens, vedação de afirmação falsa e classificação da categoria correta; respeitar idade/legislação local.
Cada tentativa API retorna status + reason; publicação assíncrona precisa polling/status confirmação; erro deve aparecer no dashboard com motivo, nunca ser mascarado.
Não usar termos disfarçados, categorias indevidas nem imagens enganosas para contornar a política. Mudança regulatória ou de plataforma implica revalidação.
## Logística
Até aprovação da regra de fulfillment de revenda sob demanda, **não** prometer despacho no mesmo dia por pressupor que BeHot entrega sempre: próprio Owner informa que pode retirar, não comprovação contratual. Avaliar prazos e proteção de produto adulto na embalagem.
