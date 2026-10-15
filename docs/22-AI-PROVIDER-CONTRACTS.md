
# AI & Media providers | especificação futura
## Texto comercial: provider-agnostic
Providers desejados: DeepSeek e OpenAI via API keys próprias; preços e free tiers são dinâmicos, nunca presumir gratuito. Cada execução tem provider/model/version, token counts, custo calculado quando tarifário conhecido, original, resultado, revisão e prompt fingerprint; limite diário mensal e circuit breaker.
### Data provenance
Input: SKU, marca, nome, categoria, dimensões, composição, voltagem, bateria, instruções, garantia, GTIN, EAN, imagens autorizadas e fatos confirmados do fornecedor/Bling. Fields desconhecidos viram `UNKNOWN`, nunca palpites de potência, certificações, contraindicações ou peso.
LLM propõe `title`, `summary`, `benefits`, `attributes`, `channel_copy`, `confidence`, `unsupported_claims` e `sourceReferences` como JSON válido; aplicação valida schema, divergência, termos proibidos por canal e humano aprova draft. SEO não implica garantia de aprovação ou performance.
Não injetar HTML do fornecedor sem sanitização: páginas são dados não confiáveis (prompt injection).
## Imagem comercial
Primeiro pipeline **não generativo e grátis/open source quando possível**: limpeza de fundo, crop, contraste, balanço de branco, sharpening e resize usando bibliotecas no worker; execução local/host privado definida por viabilidade. Opcional provider imagem configurável, incluindo modelos abertos auto-hospedados ou serviço externo com preço/termos aprovados.
GPU local é opcional, **não** pressupor disponível num app web hospedado. Serviços externos 'free' podem ter cotas, restrições de conteúdo e custo indireto. Todas as imagens têm license/source, original preservado, histórico de versão e revisão antes de anúncio.
Critérios: produto mantém forma, textura, cor, dimensão aparente, rótulo, acessórios/itens incluídos. Sem adicionar funcionalidades nem apagar avisos e marcas. Proibir imagem que sugira uso explícito se canal não permitir. Respeitar direitos de imagem do fornecedor/marca e política do provedor IA.
## Provider Settings
API key armazenada somente via endpoint server + vault, mascarada após salvar. Tela exibe provider, modelo, status, custo e teste com fixture; exclusão/revogação e auditoria. IA jamais recebe credenciais de Bling/fornecedor, CPF, endereço ou dados fiscais.
## QA e testes
Duas implementações LLM mockadas, erro 429/timeout e fallback opt-in; JSON schema, hallucination detection contra fontes, comparação de imagem original e editada, compliance, orçamento e trilha de quem aprovou. Todo draft permanece NÃO PUBLICADO até decisão.
