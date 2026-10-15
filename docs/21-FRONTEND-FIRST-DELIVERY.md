
# Frontend-first | proposta para acelerar feedback visual
**Preferência do Owner:** ver a experiência pronta antes da integração ampla. **Não sacrificar gates de segurança, CI e DoD.**
## Sequência sugerida
**Etapa A, atual WO-BLG-001, dentro do escopo aprovado:** UI skeleton responsivo, design tokens, login e Settings/Integrations (Bling) + página dashboard vazia DEMO explicitamente marcada; contratos estáticos tipados, fixtures sem dados pessoais; simultaneamente backend OAuth isolado, segurança e testes.
**Etapa B, após WO-001 APPROVED:** ampliar UI do catálogo, detalhes SKU/variante, fornecedor e disponibilidade usando MSW/mocks, com E2E visual; conectar read-only vertical slice na WO apropriada.
**Etapa C:** Estúdio IA cards com comparação e validação de campos, gerenciamento anúncios canal-status, validação de política; APIs reais chegam após correspondente contrato e audit gate.
**Etapa D:** operações de pedido, fiscal, financeiro, logística, alertas, Settings seguros e reconciliação em lotes de WOs estritas.
## UX estados obrigatórios
`DEMO`/mock não exibível como valor real; `CONNECTED` só após OAuth live; `SYNCING`, `STALE`, `ERROR`, `BLOCKED_POLICY`, `DRAFT`, `PENDING_REVIEW`, `PUBLISHED_CONFIRMED`, `PAUSED_CONFIRMED`.
Sinalização de última sincronização + origem de dados; versão desktop primeiro para feedback rápido e adaptação mobile obrigatória.
## Engenharia de contratos
- Definir contratos de UI, Zod validators, DTOs, fixture generator e design system antes dos adapters.
- Nunca colocar acessos Bling/fornecedor/modelo diretamente em componentes frontend.
- Cada tela recebe feature flag; botões que não têm API real **disabled** com explicação ou usam modo simulado claramente demonstrável (sem endpoint de escrita).
- Assim que endpoint chega, contract tests ficam verdes sem reescrever páginas.
- QA independente mede responsividade, acessibilidade, loading/error e aderência ao modelo.
## Critério de STOP
Visualização aprovada = design accepted, **não** WO completa. Somente integração real+testes+deploy/smoke+audit encerram WO e versão conforme DoD. Não abrir codebase amplo de telas fora da WO atual até gate.
