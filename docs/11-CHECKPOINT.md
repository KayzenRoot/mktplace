# Checkpoint
**Data:** 2026-10-15
**Pack:** 0.1.0-draft
**Fase:** SOURCE_CHECK / DOCUMENTATION PROPOSAL
**Veredito:** PENDING AUDIT (não confundir com APPROVED)
## Estado verificado
- Repositório GitHub `KayzenRoot/mktplace` localizado; originalmente vazio, público.
- Branch documental: `docs/BLG-BOOT-001-source-pack`; PR #1 aberta e ainda não integrada, status PENDING AUDIT.
- API Bling v3 documentação oficial consultada (OAuth, JWT, limites e webhooks).
- Nenhum app Bling foi cadastrado por este processo; nenhuma credencial conhecida.
- Código, testes, CI e deploy: NÃO implementados/não executados.
## Owner decisions recebidas após draft original
- 2026-10-15: repo público explicitamente mantido para CI/Actions grátis (ADR-009), sem publicação de segredos.
- 2026-10-15: solicitada integração futura de portal autenticado de fornecedor sem API para observar disponibilidade e preparar atualização controlada Bling (ADR-010 e WO-BLG-009/010 no backlog).
- URL BeHot `https://www.behot.com.br/` informada. Site público, catálogo `/produtos/`, login `/account/login/` e alguns indicadores de disponibilidade confirmados por fontes públicas (documento `19-BEHOT-PUBLIC-DISCOVERY.md`). Login real, validação de SKU, termos de scraping, exportação B2B e dados privados AINDA NÃO VERIFICADOS; credenciais NÃO recebidas nem solicitadas no chat.
- Proprietário enviou foto da página BeHot autenticada para exemplificar venda sob demanda. Produto: R$178,63 ou R$151,84 Pix; botão COMPRAR/campo de quantidade, mas NENHUMA contagem real de estoque. Foto não incluída no repositório (dados pessoais incidentais).
- Objetivo de negócio esclarecido: ofertar itens da BeHot sem estoque físico e buscar no mesmo dia após venda. ADR-011 proposta e critérios adicionais em WO-BLG-009/010 futuras.
- Preservar a WO-BLG-001 sem mudança de escopo; update deste pack é proposta na mesma PR, não checkpoint promovido.
## Próximo incremento necessário
Após revisão/merge de BLG-BOOT-001, executar `work-orders/WO-BLG-001.md` com Context Lock SHA e hashes do Source Pack na execução.
## Bloqueios objetivos
LIVE_VALIDATION_DEPENDENCIES: provedor de login/admin, banco/hospedagem/domínio HTTPS, app privado Bling, scopes e owner authorization.
Não bloqueiam criação de código/testes mock; bloqueiam alegação de deploy conectado/versão concluída.
## Checkpoint Delta futuro (NÃO aplicado)
Se BOOT APPROVED: registrar PR, SHA head e merge, classificar docs APPROVED, apontar primeiro WO como READY.
Se WO-001 APPROVED: registrar head SHA, CI, smoke real, deployment URL e riscos residuais. Executor apenas propõe, auditor valida.

## Delta de requisitos recebidos em 2026-10-15 (não promovido)
- Owner definiu MKTPlace cockpit de produtos/anúncios/vendas/notas/financeiro para Mercado Livre, Shopee, Amazon via Bling; IA de texto (DeepSeek/OpenAI), IA de imagem grátis/local se possível, config central de credenciais e fornecedores, UI primeiro, múltiplos agentes paralelos.
- Owner escolheu opção **B**: após venda, reconsultar BeHot; se persistir sinal de disponibilidade, considerar republicar no máximo 1 oferta virtual. **Não é autorização para execução imediata**: exigir verificação de SKU/variante, TTL, reserva, propagação entre canais, política e writeback demonstrados. Falha = manter pausado, não escrever estoque físico.
- Contrato OpenAPI Bling atual (2026-10-15) comprova endpoints de anúncios criar, obter, alterar, publicar e pausar; compatibilidade por marketplace e scopes ainda não testada.
- Source Pack proposto ampliado em PR #1; docs `20-24`; WO-BLG-001 não executada nem liberada; não promover checkpoint nem iniciar próximas WOs.
