# Módulo: pagos

## Propósito
Registrar cargos y reembolsos de las órdenes con pasarelas externas o de forma manual, y ser el **único** que cambia `Ordenes.EstadoPago`.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Pagos` | orden, `Tipo` (`CARGO`/`REEMBOLSO`), pasarela, `TransaccionId`, monto, moneda, `Estado` (`PENDIENTE`/`APROBADO`/`RECHAZADO`), `Motivo`, `PagoOrigenId` (para reembolsos), `DetallesRespuesta` | (pasarela, transacción) único; monto > 0; solo-añadir (D-009) |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| PAG-001 | Pasarelas v1: `MANUAL` y `STRIPE` en modo prueba (D-015). | servicio |
| PAG-002 | Iniciar pago en línea: solo órdenes `ABIERTA` + `PENDIENTE` no vencidas; crea en Stripe un intento por el `Total` exacto (centavos) con metadatos `orden_id`, `tienda_id`, y registra `Pagos` `CARGO` `PENDIENTE`. Devuelve el `client_secret` al cliente. | servicio |
| PAG-003 | Webhook: verifica firma; idempotente por (`STRIPE`, `TransaccionId`); si el evento es `succeeded` y el monto = `Total` → pago `APROBADO` y ejecuta la **confirmación de pago** (PAG-005). Un evento repetido responde 200 sin efectos. | controlador + servicio |
| PAG-004 | Pago manual: el personal con `ORDENES_GESTIONAR` registra un `CARGO` `APROBADO` por el `Total` con referencia opcional (nro. de operación) → confirmación de pago. | servicio |
| PAG-005 | **Confirmación de pago** (una transacción): orden `PAGADO`; inventario `confirmarVenta` (INV-004); `ComisionPlataforma` (SUS-012); balance (BAL-001); si ninguna línea requiere envío → preparación `ENTREGADO`. Tras commit: `OrdenPagadaEvento`. | servicio |
| PAG-006 | Pago llega para orden ya `ANULADO` (vencida): se registra `APROBADO`, la orden **no** se revive automáticamente; se marca para reembolso y se audita (Q-013). | servicio |
| PAG-007 | Reembolso: requiere `REEMBOLSOS_EMITIR`, orden con pago `PAGADO` o `PARCIALMENTE_REEMBOLSADO`, monto > 0 y ≤ (total cobrado − total reembolsado), motivo obligatorio. Por la misma pasarela del cargo (Stripe refund o manual). Opcional: líneas y cantidades a reponer en inventario (INV-006). | servicio |
| PAG-008 | Tras reembolso: suma de reembolsos = cobrado → `REEMBOLSADO`; si no → `PARCIALMENTE_REEMBOLSADO`. Balance BAL-002. | servicio |
| PAG-009 | Nunca se guardan datos de tarjeta; `DetallesRespuesta` guarda solo el objeto resumido de la pasarela (sin PAN). | adaptador |
| PAG-010 | La comunicación con la pasarela queda **fuera** de la transacción de base de datos que bloquea filas (se llama antes o después, nunca con bloqueos abiertos). | servicio |

## Permisos
| Acción | Permiso |
|---|---|
| Iniciar pago en línea | quien tenga el `TokenAcceso` de la orden |
| Registrar pago manual | `ORDENES_GESTIONAR` |
| Reembolsar | `REEMBOLSOS_EMITIR` |
| Webhook | público con firma válida |

## Pruebas asociadas
| Regla | Prueba |
|---|---|
| PAG-003 | Mismo webhook dos veces → un pago, un descuento de stock, balance sumado una vez |
| PAG-007 | Reembolsar 60 + 50 sobre total 100 → el segundo 422 |
| PAG-005 | Orden digital pagada → preparación `ENTREGADO` |
