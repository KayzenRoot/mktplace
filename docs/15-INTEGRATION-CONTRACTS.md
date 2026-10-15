# Bling API v3 - Integration Contracts
**Fontes oficiais lidas em 2026-10-15:**
- https://developer.bling.com.br/aplicativos
- https://developer.bling.com.br/migracao-jwt
- https://developer.bling.com.br/limites
- https://developer.bling.com.br/webhooks
- https://developer.bling.com.br/referencia
- https://developer.bling.com.br/homologacao
## Hosts
Authorize: `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=<id>&state=<nonce>` (validar host exato e casing atual na documentação durante preflight).
API/token: `https://api.bling.com.br/Api/v3`; URL antiga `bling.com.br/Api/v3` API foi descontinuada (30/04/2026).
Token: `POST /oauth/token`, form urlencoded, Basic base64(client_id:client_secret), header `enable-jwt: 1`. Refresh: `grant_type=refresh_token`; enforçar header JWT também em chamadas API. Access token tipo Bearer.
## Limitações conhecidas
Code vive 1 minuto e só pode ser usado uma vez; reuso pode revogar acesso. Refresh token informado com validade de 30 dias; usar `expires_in` da resposta, nunca durações hardcoded para access. Ao refresh, persistir refresh token substituto atomica e seguramente quando retornado.
API limite conta-wide: 3 req/s e 120k req/dia, proteção de IP incluindo 20 token requests/60s. Paginacao geralmente até 100 por página. Filtros de data >1 ano retornam 400.
## Escopos
Definir escopos **exatos** no painel do Bling no primeiro preflight, minimamente para uma leitura read-only da WO-001. Não supor nomes de escopos. Adicionar escopo mais tarde pode revogar usuários e exigir nova autorização.
## Primeiro GET
Proposta: `GET /produtos?pagina=1` se escopo de leitura de produtos estiver confirmado. Apenas sinalizar sucesso; não logar nomes/valores. Alternativa somente se contrato OpenAPI validar outra rota menor read-only. Não efetuar POST/PUT/PATCH/DELETE comercial/fiscal.
## Webhooks (somente fase posterior)
`X-Bling-Signature-256: sha256=<hex>`, HMAC SHA256 do raw payload com Client Secret, `eventId` idempotente, `companyId` deve ser conferido, entrega fora de ordem, 2xx em até 5s, retentativas até 3 dias. Recursos: order, product, stock, virtual_stock, product_supplier, invoice, consumer_invoice. **Sem webhook documentado para financeiro** nesta lista.
## Erros
401 -> refresh controlado/reconectar; 403 -> scope insufficiente, não repetir; 429 -> backoff jitter/cooldown; 5xx -> fallback/observabilidade. Respeitar `Retry-After` se houver, não presumir presente.

## Capacidade descoberta em 2026-10-15: Bling v3 Anúncios
OpenAPI: https://developer.bling.com.br/build/assets/openapi-Dw6cY8yQ.json lista `/anuncios` GET/POST e `/anuncios/{idAnuncio}` GET/PUT/DELETE, `/publicar` e `/pausar` POST. Integração Bling com ML/Shopee/Amazon é documentada nas páginas oficiais de ajuda, mas **não presumir** suporte do mesmo endpoint em toda loja sem dry-run/teste conforme idLoja/tipoIntegracao e scopes.
- https://ajuda.bling.com.br/hc/pt-br/articles/34344221775255-Como-criar-novos-an%C3%BAncios-simples-no-Bling-e-enviar-para-o-Mercado-Livre
- https://ajuda.bling.com.br/hc/pt-br/articles/360058301693-Autentica%C3%A7%C3%A3o-com-a-Shopee
- https://ajuda.bling.com.br/hc/pt-br/articles/5099560621335-Exporta%C3%A7%C3%A3o-de-produtos-para-a-Amazon
- O sistema só requer login no Bling para operar via sua API, mas a conexão inicial de cada loja no próprio Bling pode exigir autenticação e autorização do seller; não armazenar senha de ML/Shopee/Amazon no MKTPlace sem necessidade.
