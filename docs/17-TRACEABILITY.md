# Traceability
| Requisito | Incremento | Evidência planejada |
|---|---|---|
| RF-001 | WO-BLG-001 | T001 T002 E2E |
| RF-002 | WO-BLG-001 | T003 |
| RF-003 | WO-BLG-001 | T004 T005 T006 |
| RF-004 | WO-BLG-001 | T007 |
| RF-005 | WO-BLG-001 | T008 live smoke |
| RF-006 | WO-BLG-001 | T009 |
| RNF-001..003 | WO-BLG-001 | T002 T006 T010 T012 |
| RNF-004..005 | WO-BLG-001 | T007 T008 integration |
| RF-007 | WO-BLG-002 | nova WO e testes |
| RF-008 | WO-BLG-003 | nova WO e testes |
| RF-009 | WO-BLG-004 | nova WO e testes |
| RF-010 | WO-BLG-005 | nova WO e testes |
| RF-011 | WO-BLG-006 | nova WO e testes |
| RF-012..013 | futuras | riscos HIGH_ASSURANCE reavaliados |
Status da evidência: **TODO** em todas as linhas, não comprovar testes fictícios.

| RF-014..016, RNF-008..010 | WO-BLG-009 | testes de login mock, DOM, sessão, segurança e conciliação; AINDA NÃO EXECUTADOS |
| RF-017 | WO-BLG-010 | dry-run, idempotência, revisão de diffs e auditoria escrita; AINDA NÃO EXECUTADOS |

| RF-018..022 RNF-011..012 | WO-BLG-009/010 (future) | fixture botão Comprar vs estoque desconhecido, reserva concorrente multicanal, freeze stale, virtual vs físico, margens e compliance; PENDING |

| RF-023..026, RF-033 RNF-013..014 | futuras WOs (após 001) | typed fixture contracts, OpenAPI anúncios, UI E2E, canal live com auth e quotas; PENDING |
| RF-027..029, RF-031 RNF-015 | futuras WOs IA/Settings | truthfulness/spec validation, provider mock, costs, fidelity/license e secret vault; PENDING |
| RF-030, RF-032 | futuras WOs canais e pedidos | policy matrix per SKU, channel reject/approve, no oversell / no unapproved fiscal; PENDING |
| RNF-016 | todas WOs | worktree ownership, merge tests/CI em head final, evidence SHA; PENDING |

| Rule B pós-venda (Owner 2026-10-15) | WO-BLG-010 FUTURE | teste E2E pedido -> reconsulta fornecedor -> avaliação -> publicar até 1 / bloquear, hold e multicanal; PENDING |
