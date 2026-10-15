# Project Overview
## Problema
Operar produtos, vendas, estoque, notas e financeiro em múltiplas telas do Bling é custoso. Desejamos uma visão única com dados autorizados e automações graduais.
## Objetivo
Web app privado e responsivo, acessível por internet, conectado a UMA conta Bling por OAuth 2.0, sem substituir o ERP oficial.
## Usuário-alvo
Proprietário/operador do negócio. Apenas um administrador na fase inicial. Sem marketplace próprio nem multiempresa.
## Resultados esperados
- Conectar/reconectar/desconectar a conta sem expor tokens.
- Estado de integração observável e resolução clara de erros.
- Evolução read-only para catálogo, pedidos, estoque, fiscal e contas financeiras.
- Futuras operações de escrita com escopo, confirmação e trilha de auditoria.
## Indicadores propostos
Conectividade OAuth testada; nenhuma credencial vazada; testes críticos 100%; sincronização futura reconciliável; status de stale visível.
## Premissas
Aplicativo do Bling deve ser cadastrado pelo proprietário com link de redirecionamento HTTPS e permissões mínimas.
Hospedagem, domínio e banco ainda NÃO foram provisionados.

## Integração fornecedor futuro
Um fornecedor externo oferece catálogo e disponibilidade em portal autenticado sem API declarada. O MKTPlace deverá coletar somente com login autorizado e permitido, reconciliar SKU/catálogo e manter disponibilidade de fornecedor separada do estoque físico do operador no Bling. Portal, termos e formato dos dados ainda não informados, logo viabilidade real NÃO verificada. Repositório permanecerá público por decisão expressa do proprietário.
