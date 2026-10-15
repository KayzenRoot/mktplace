
# MKTPlace | Mapa de Módulos (owner conversation 2026-10-15)
**Estado:** PRODUCT BLUEPRINT PROPOSED, não code-ready fora WO; Bling é ERP/intermediador único, MKTPlace é cockpit, BeHot fornecedor sob demanda.
**Objetivo:** tudo que o usuário possa controlar via API Bling sem acessar manualmente os canais no dia a dia. Onboarding externo e módulos não expostos em API exigem validação de limite/situação explícitos.
**Princípio UI-first:** todas as telas têm estados de fixture **DEMO**, loading, sem dados, error e data real; telar pronta nunca equivale a feature pronta.

| ID | Módulo | Valor na operação | Fase | Dependência real |
|---|---|---|---|---|
| M00 | App Shell & Design System | sidebar, topo, mobile, cards, tabelas, notificações, navegação | NECESSARY WO-001 para login/settings | UX, fixtures |
| M01 | Acesso & Segurança | login Owner, autorização, sessões, ACL e auditoria | NECESSARY WO-001 | OIDC, cofre, banco |
| M02 | Central Bling | OAuth v3, scopes, health, reconectar, throttle, tokens seguros | NECESSARY WO-001 | Bling app privado |
| M03 | Dashboard Operacional | KPIs por canal, pedidos, tarefas, finanças, erros, last_sync | IMPORTANT | Bling read-only |
| M04 | Fornecedores / BeHot | coletar catálogo, disponibilidade/variante/preço, mudanças e confiança | IMPORTANT | permissão/termos; 009 |
| M05 | Produtos & Catálogo Mestre | Bling SKU/GTIN/variante, fotos, custo, categorias, atributos, versionamento, edição | IMPORTANT | Bling produtos |
| M06 | Estúdio IA de Conteúdo | títulos, bullets, descrições, especificações, SEO por canal, origem e revisão | IMPORTANT | dados verificados, LLM |
| M07 | Estúdio de Imagens | recorte, fundo, iluminação, resize, upscale, versões, QA e licença | IMPORTANT | fotos licenciadas, provider |
| M08 | Validação por Marketplace | categoria adulta, critérios de anúncio, mídia e atributos por canal | IMPORTANT | regras atuais ML/Shopee/Amazon |
| M09 | Gestão de Anúncios | rascunho, publicar, editar, pausar, status/errors/retry, preços por canal | IMPORTANT | Bling `/anuncios`, loja integrada |
| M10 | Disponibilidade & Oferta Virtual | stock próprio vs fornecedor, frescor, expor 0/1, hold, rechecagem B | IMPORTANT | 009 + 010, API/canal |
| M11 | Pedidos & Atendimento Operacional | pedidos, pagamentos, fila, status, retirada na BeHot, separação/entrega | IMPORTANT | Bling pedidos e canais |
| M12 | Fiscal & Documentos | notas fiscais, rejeições, anexos, status, emitir depois de gates | IMPORTANT para leitura; HIGH_ASSURANCE escrita | Bling fiscal e A1 nele |
| M13 | Financeiro & Precificação | recebíveis, pagáveis, taxas marketplace, margens e lucro estimado | IMPORTANT | Bling contas + dados custo |
| M14 | Clientes & CRM Operacional | contatos e histórico permitido; mensagens apenas se API expuser | IMPORTANT leitura, FUTURE mensagens | Bling contatos |
| M15 | Logística & Expedição | etiquetas, frete, rastreio, SLA, coleta fornecedor | IMPORTANT | Bling logística + transportadora |
| M16 | Analytics & Alertas | relatórios, histórico, erros, ruptura, custos IA, tarefas pendentes | IMPORTANT | dados reconciliados |
| M17 | Configurações & Automação | provedor IA, imagens, BeHot user/pass em vault, Bling, políticas, jobs, logs e health | NECESSARY subconjunto segurança WO-001; IMPORTANT restante | owner ACL, storage cifrado |

## Tela Configurações, detalhamento obrigatório
Aba Integrações: Bling OAuth, lojas ML/Shopee/Amazon status vindo do Bling (onboarding inicial pode abrir Bling); BeHot domínio/login testando sem revelar senha.
Aba IA: provedor de texto (DeepSeek/OpenAI), modelo, API key, limite orçamento/execução, prompts de sistema versionados, validação de fatos; imagem via local/open source/API com custo e termos.
Aba Comerciais: margens mínimas e faixas, preço por canal, frete/taxa/fiscal, política stock virtual/frescor, reserva e escolha B confirmada.
Aba Segurança/Operações: auditoria, health, jobs, horário polling, cofre e rotação, backup, alerta, ambiente; jamais renderizar segredo em plaintext após salvar.
Padrão: qualquer ação comercial automática deve ter dry-run, autorização e logs, bloquear canal não elegível.

## Jornadas ponta a ponta
- **Produto BeHot** -> leitura autorizada -> SKU/variante/availability -> draft MKTPlace -> enriquecer IA com facts-only -> revisão foto/spec -> criar/atualizar produto Bling -> verificar elegibilidade de canal -> criar anúncio API Bling -> publicar aprovado -> reconsultar status.
- **Venda** -> marketplace -> Bling -> webhook/poll MKTPlace -> hold da oferta virtual -> reconsultar BeHot -> **opção B**: se disponível e regra segura, republicar no máx 1; se não ou unknown, manter pausado -> compra/retirada manual -> nota via Bling com controles -> logística -> financeiro.
- **Sem disponibilidade/sync** -> congelar oferta (quando suporte comprovado) e alertar; jamais zerar estoque físico próprio por falha de fornecedor.

## Regra de maturidade
Especificação completa não autoriza simultaneamente implementação de todas as WOs. Priorizar o menor incremento necessário que desbloqueie a próxima capacidade. Paralelismo apenas dentro de WO aprovada e com ownership isolado.
