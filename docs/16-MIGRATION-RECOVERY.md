# Migration & Recovery
## DB migration
Migrações versionadas em PR, com testes em DB efêmero; preferir expand/contract; schema compatível no rollback; sem migrações destrutivas automáticas.
## OAuth recovery
- `state` expirado/invalidado -> reiniciar conexão; nunca reusar code.
- Token expirado -> refresh single-flight; erro `invalid_grant` -> `reconnect_required`, não loopar.
- Client Secret comprometido -> revogar na Área do Integrador, girar segredo do deploy, reautorizar manualmente.
- Chave de cifragem comprometida -> rotation key-version, revogar tokens se não puder garantir segurança.
- Perda de banco -> restauração cifrada + consistência; se impossivel, nova conexão no Bling; **nunca** reconstituir refresh token de logs.
- Timeout/429 Bling -> retry limitado apenas GET seguro com jitter; callback/code exchange não é repetido automaticamente.
## Webhooks futuro
Ingestão at-least-once, deduplicação por `eventId`, reconciliação periódica; ao retomar após indisponibilidade prolongada reconstruir com paginação e janela.
## Operação
Playbook deve registrar ação, timestamp, request IDs e resultado, sem dados pessoais/segredos.
Para deploy válido: backup, restore drill, revogação testada em ambiente seguro, incident contact e rollback/roll-forward documentados.
