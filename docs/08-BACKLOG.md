# Backlog priorizado
| ID | Classificação | Incremento | Descrição | Dependência |
|---|---|---|---|---|
| BLG-BOOT-001 | NECESSARY | Docs | Source Pack versionado e revisado | nenhuma |
| WO-BLG-001 | NECESSARY | 0.1.0 | segurança + OAuth JWT + status + smoke GET | BOOT aprovado |
| WO-BLG-002 | IMPORTANT | 0.2 | produtos/estoques listagem read-only + cache + paginação | 001 APPROVED |
| WO-BLG-003 | IMPORTANT | 0.3 | vendas/pedidos listagem/filtros read-only | 002 APPROVED |
| WO-BLG-004 | IMPORTANT | 0.4 | fiscal: notas, estados, documentos sem emissão | 003 APPROVED |
| WO-BLG-005 | IMPORTANT | 0.5 | contas a pagar/receber read-only e visões de caixa | 004 APPROVED |
| WO-BLG-006 | IMPORTANT | 0.6 | webhooks assinados, inbox, dedupe, reconcile | 005 APPROVED |
| WO-BLG-007 | FUTURE | 0.7 | escritas de produtos/pricing com dry-run/auditoria | ordem e escopos aprovados |
| WO-BLG-008 | FUTURE | >=0.8 | automações, alertas e financeiro/fiscal com aprovação | auditoria reforçada |
| WO-BLG-009 | IMPORTANT | após 002 | monitor BeHot de sinais de disponibilidade por variante e conciliação read-only | 002 APPROVED; URL+termos e credenciais via cofre |
| WO-BLG-010 | IMPORTANT | após 007 e 009 | publicação sob demanda (sem estoque físico), reserva pós-venda e atualização comercial segura | 007 e 009 APPROVED; política estoque e writeback auditadas |
## Política
Somente iniciar próxima WO depois da anterior APPROVED e checkpoint sincronizado. Itens IMPORTANT não entram automaticamente na WO corrente.
Fazer apenas incremento NECESSARY para satisfazer DoD, sem reescrever tecnologia desnecessariamente.

## Planejamento macro sem abrir nova WO executável
Agrupar WOs FUTURAS após a WO vigente nas sequências de capacidade: (1) UI shell + mock e conexão; (2) catálogo e BeHot somente leitura; (3) Product Studio com IA texto/imagem; (4) Elegibilidade por canal e anúncios Bling; (5) estoque sob demanda e pedidos; (6) fiscal/financeiro/logística; (7) relatórios, alertas, automação. IDs estáveis novos somente ao chegar cada NEXT NECESSARY INCREMENT, evitando tarefas concorrentes fora da WO aprovada.
UI/UX, IA e canais documentados em `20..24`, classificação no Scope. Paralelizar **subtarefas dentro da mesma WO** sem pular gates. Não reivindicar progresso de implementação por documentação.
