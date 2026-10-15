# Requirements
## Funcionais
- **RF-001 [NECESSARY WO-001]** Login seguro do proprietário e negação total a não autorizados.
- **RF-002 [NECESSARY WO-001]** Iniciar OAuth 2.0 Authorization Code com state único, vinculado à sessão e expiração.
- **RF-003 [NECESSARY WO-001]** Receber callback, validar state, trocar code uma única vez no backend e armazenar tokens cifrados.
- **RF-004 [NECESSARY WO-001]** Renovar credenciais em segurança, serializar refresh e sinalizar reconexão.
- **RF-005 [NECESSARY WO-001]** Consultar recurso read-only autorizado e mostrar conexão saudável, sem payload pessoal nos logs.
- **RF-006 [NECESSARY WO-001]** Desconectar/revogar com confirmação, status correto e sem expor segredo.
- **RF-007 [IMPORTANT futuro]** Listar produtos, preços, SKUs, custos e estoque.
- **RF-008 [IMPORTANT futuro]** Listar pedidos e origens da venda, com filtros.
- **RF-009 [IMPORTANT futuro]** Consultar notas e situações fiscais; sem emissão/cancelamento automático.
- **RF-010 [IMPORTANT futuro]** Consultar contas a pagar e receber, vencimentos e totalizações.
- **RF-011 [IMPORTANT futuro]** Sincronizar por paginação, webhooks e reconciliação sem duplicatas.
- **RF-012 [FUTURE]** Escritas autorizadas com preview, confirmação, trilha e recuperação.
- **RF-013 [FUTURE]** Alertas, relatórios e IA assistiva.
## Não funcionais
- **RNF-001** TLS obrigatório; sessão segura; 2FA no provedor de identidade; allowlist de proprietário.
- **RNF-002** Client Secret/refresh/access token exclusivamente no servidor, criptografia autenticada em repouso, sem envio ao browser.
- **RNF-003** 0 vazamentos de credenciais em logs, resposta, commit ou CI; rotação documentada.
- **RNF-004** Respeitar limite Bling (3/s, 120k/dia), proteger endpoint de tokens (20 requisições/60s por IP conforme documentação) e backoff em 429.
- **RNF-005** IDs e empresa vinculada verificados antes de qualquer futura escrita; single-company como invariante.
- **RNF-006** Timestamps UTC no banco; apresentação pt-BR e America/Sao_Paulo; valores monetários DECIMAL.
- **RNF-007** Sem promessa de disponibilidade até testes em ambiente de produção; observabilidade com metadados não sensíveis.
## Origem
Requisitos de negócio: solicitação do proprietário (2026-10-15). Contratos externos: documentação oficial do Bling indicada em `15-INTEGRATION-CONTRACTS.md`.

## Extensão aprovada para planejamento (fornecedor sem API declarada)
- **RF-014 [IMPORTANT futuro WO-BLG-009]** Configurar um fornecedor externo pelo domínio permitido, status de autenticação e fonte de catálogo, sem imprimir ou expor segredos.
- **RF-015 [IMPORTANT futuro WO-BLG-009]** Monitorar a disponibilidade e opcionalmente preço/identificador de produtos do fornecedor com Playwright autenticado, dentro de políticas e condições permitidas, e guardar últimas verificações e evidência mínima.
- **RF-016 [IMPORTANT futuro WO-BLG-009]** Criar mapeamento explícito produto/variante fornecedor -> SKU/ID Bling, revisar correspondências ambíguas, rejeitar inferências frágeis e distinguir ausência de falha técnica.
- **RF-017 [IMPORTANT futuro WO-BLG-010]** Aplicar alterações à disponibilidade comercial/publicação Bling apenas após regra aprovada, dry-run, confirmação ou política de automação aprovada, testes de integração e trilha; saldo do fornecedor não pode se tornar automaticamente estoque próprio.
- **RNF-008** Repositório GitHub público; GitHub Actions CI usa runners padrão e não recebe segredos nas verificações de PR/fork. Artefatos/cache/logs sem sessão autenticada, PII ou credenciais.
- **RNF-009** Credenciais e cookies de fornecedor exclusivamente em secret manager/storage cifrado com acesso server-only; sessão e senha nunca em Git, artifacts, screenshots ou resposta web. Login automatizado respeita 2FA/CAPTCHA sem contornar mecanismos anti-abuso.
- **RNF-010** Frequência/carga gentil e configurável; respeitar permissão/termos e rate limits, parar ante bloqueio/403/429/CAPTCHA ou mudanças de DOM. Falha de scraping jamais provoca quantidade zero em massa no Bling.

## Negócio: venda sob demanda com retirada local (confirmed owner intent, 2026-10-15)
- **RF-018 [IMPORTANT WO-BLG-010, pós-009/007]** Disponibilizar produtos do fornecedor para venda sem mantê-los em estoque físico próprio, usando uma disponibilidade virtual **limitada e distinta** do saldo físico, conforme suporte comprovado no Bling e nos marketplaces.
- **RF-019 [IMPORTANT WO-BLG-009]** Identificar sinais de compra por produto+variante (por exemplo, botão `COMPRAR` ativo, aviso `ESGOTADO`), carimbo de atualização e nível de confiança; campo de quantidade da página não comprova quantidades existentes.
- **RF-020 [IMPORTANT WO-BLG-010]** Ao chegar pedido de qualquer canal, reservar/retirar SKU da oferta virtual para não permitir vendas adicionais enquanto a reposição na BeHot é confirmada; detectar atualizações com concorrência e sincronização eventual.
- **RF-021 [IMPORTANT WO-BLG-010]** Produto sem confirmação recente, informação contraditória ou sessão expirada deve seguir política explícita de congelar oferta com aviso, sem reescrever estoque físico. Avisos de indisponibilidade confirmada podem desabilitar a oferta virtual conforme dry-run/auditoria.
- **RF-022 [IMPORTANT WO-BLG-010]** Somente publicar automaticamente produtos elegíveis por canal, validando restrições de categorias, regras de anúncio, condições de preço/margem, custos de Pix/cartão/frete/imposto e disponibilidade do fornecedor.
- **RNF-011** Nenhuma coleta pode garantir reserva no fornecedor; risco residual de ruptura e SLA de retirada devem ser explícitos. Disponibilidade não garante a compra real.
- **RNF-012** Disponibilidade virtual proposta inicial de no máximo 1 por SKU/variante, **sujeita a validação técnica e comercial**; jamais preencher saldo físico do Bling com valores fictícios. A primeira venda gera hold até reconciliação.

## Expansão funcional: operação completa Bling + marketplace + IA (intenção Owner 2026-10-15)
- **RF-023 [IMPORTANT após WO-001]** Painel web único com todas as áreas do Bling e marketplaces; marcações DEMO/real, staleness, status da operação.
- **RF-024 [IMPORTANT]** Criar e editar cadastro Bling pelo sistema: SKU, GTIN/EAN quando aplicável, variações, atributos verificáveis, fotos, título, preço, dimensões, situação, categoria e NCM quando aplicável; erros e diff rastreáveis.
- **RF-025 [IMPORTANT]** Gerir anúncios por loja com ações rascunho, publicar, pausar e atualizar via **Bling API v3 /anuncios** e idLoja/tipoIntegracao, condicionado a escopos e suporte de cada integração; sem prometer sucesso antes do retorno canal.
- **RF-026 [IMPORTANT]** Importar e exibir vendas, pagamentos e taxas conforme dado Bling disponível, notas fiscais, contas, estoque e logística; relatórios cross-channel, conciliação e filas de falhas.
- **RF-027 [IMPORTANT]** Geração assistida de título, descrição e atributos por provedor de LLM configurável (DeepSeek/OpenAI) preservando origem de cada fato e sinalizando informações ausentes em vez de inventá-las.
- **RF-028 [IMPORTANT]** Ferramentas de imagem com recorte, fundo, correção de iluminação, realce; IA opcional (local/open source ou API) com comparação original vs resultado e verificação de fidelidade do produto.
- **RF-029 [IMPORTANT]** Settings com credenciais Bling, fornecedor BeHot, LLM, processador de imagem, políticas de coleta, marketplaces, preços, margens, sincronização, alertas, usuários, custo e logs; todos secrets em cofre server-only, nunca readback plaintext.
- **RF-030 [IMPORTANT]** Validação por SKU/canal de políticas de produtos adultos, categoria correta, restrições de imagem/texto, embalagem, documentos e condições de publicação; bloqueio até elegibilidade comprovada.
- **RF-031 [IMPORTANT]** Workflow de imagem/texto da IA gera somente draft -> revisão -> publicação; auditoria de quem aprovou, modelo/provider, origem e mudanças.
- **RF-032 [IMPORTANT]** Estados de pedidos e separação/retirada fornecedor, nota e despacho; não automatizar checkout de fornecedor nem emissão/cancelamento fiscal por default.
- **RF-033 [IMPORTANT]** Adapters de marketplaces exclusivamente via Bling como principal, sem dependência de login direto ML/Shopee/Amazon no app; processos iniciais OAuth dos canais podem exigir autorização externa pelo Owner.
- **RNF-013** UX visual-first com fixtures sintéticas, contract tests e states; UI não pode transmitir informações de DEMO como reais.
- **RNF-014** Ações de anúncio/escrita idempotentes, com conferência de escopo/loja, logs de auditoria, rate limiting, confirmação e capacidade de reprocessamento seguro.
- **RNF-015** Geração de imagem e texto só com licença de uso adequada, conteúdo verídico e regras de canais; jamais alterar características físicas/etiquetas nem inventar certificações/composição/funções.
- **RNF-016** Processos paralelos precisam de Context Lock, worktrees separados, arquivos ownership claro e CI no head integrado; veredito do revisor independente.
