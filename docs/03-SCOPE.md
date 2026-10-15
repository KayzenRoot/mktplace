# Scope por fase
**Regra:** Só NECESSARY entra automaticamente no incremento corrente.
## WO-BLG-001 (NECESSARY)
Estrutura mínima Next.js/TypeScript, login proprietário, banco PostgreSQL para sessão e tokens, integração OAuth v3 com JWT, status e uma chamada de leitura, disconnect seguro, testes e deploy validado quando infraestrutura existir.
## Após WO-001
- **IMPORTANT:** produtos e estoque read-only, paginação e filtros.
- **IMPORTANT:** pedidos, fiscal e financeiro read-only, reconciliação e relatórios.
- **IMPORTANT:** webhooks com assinatura e deduplicação.
- **FUTURE:** edição de produtos, preço/estoque, integrações indiretas por canais do Bling.
- **FUTURE:** emissão/cancelamento fiscal, lançamentos financeiros e automações com aprovações específicas, provas fortes e rollback/roll-forward.
## OUT OF SCOPE V0.1
Multi-tenant, billing SaaS, marketplace direto, gateway de pagamentos, substituição de contabilidade, armazenamento de certificado A1, acesso público sem login, IA que execute mutações, scraping de painel Bling, aprovação automática de notas fiscais.
## Política de dependências
A fase de leitura só é aberta após aprovação da conexão segura; sem funcionalidades adjacentes por conveniência.
Não requisitar escopos amplos para antecipar funcionalidades; expansão posterior de escopo no Bling pode revogar instalações existentes e requer nova autorização.

## Novo fornecedor externo sem API
**IMPORTANT, fora da WO-001.** Após catálogo Bling read-only estar estável, WO-BLG-009 pode consultar portal com autenticação autorizada e capturar disponibilidade, preço e código externo. Não presumir permissão/viabilidade sem endereço e validação dos termos de uso. WO-BLG-010 será responsável pela publicação no Bling após prévia, política aprovada, testes e idempotência; depende também do mecanismo de escrita auditada previsto na WO-BLG-007.
**Nunca** usar disponibilidade de fornecedor como saldo próprio no Bling sem política empresarial explícita de estoque virtual/depósitos e correspondência exata.
Proteção de login: credenciais mantidas em cofre, não compartilhadas no chat/repo. Interdição de contorno a CAPTCHA, MFA, detecção anti-bot e paywall; preferir exportações/feeds oficiais se disponíveis.

## Requisito negócio esclarecido por foto (2026-10-15)
Owner deseja publicar produtos da BeHot mesmo sem possuir unidades físicas e repor por compra/retirada no mesmo dia. O módulo deixa de ser apenas monitor para integrar futuramente um catálogo sob demanda, **sem ativar estoque artificial nem criação de anúncios nesta WO**. A exposição proposta inicial <=1 unidade virtual por SKU/variante (somente após validação de infraestrutura e sem misturar com depósito físico). Produtos de categoria adulta estão sujeitos à política específica de cada marketplace e não são automaticamente elegíveis.
Fluxo reservado para WO-BLG-010 após dependências; NÃO avançar sobre WO-BLG-001 nem realizar testes de compra reais agora.

## Ampliação empresarial planejada (não inclui na WO-BLG-001)
**IMPORTANT** em futuras WOs: dashboard completo; produto e variações no Bling; preparação de anúncios; publicação/pausa Bling API v3; vendas, financeiro, fiscal, logística e atendimento; BeHot; enriquecimento textual e imagens; painel Settings seguro; controle de elegibilidade por marketplace. A abordagem visual-first se inicia no frontend da WO-001 e nas especificações UI, sem implementar e aprovar falsamente módulos não autorizados. Ações fiscais, credenciais em navegador, publicação de produtos proibidos e checkout de fornecedor automático continuam fora do incremento inicial.
**FUTURE**: otimização publicitária, IA autônoma que publique, multitenancy, marketplace API direto, CRM de mensagens que não estejam expostas no Bling.
Regra: Bling intermedia operações reais; UI e drafts podem ser criados com fixtures, jamais simular que dados mock são da conta.

## Variante de negócio B
Rechecagem automática após venda e eventual reposição de exposição virtual máxima 1 é **IMPORTANT FUTURO** em WO-BLG-010, não parte da conexão WO-001. Não implica compra automatizada, publicação de produto proibido, estoque real ou garantia de suprimento.
