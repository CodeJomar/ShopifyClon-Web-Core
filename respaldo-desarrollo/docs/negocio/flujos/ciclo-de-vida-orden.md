# Flujo: ciclo de vida de la orden (pago → preparación → cierre, cancelación, reembolso)

## Estados que atraviesa (camino feliz con envío)
```text
Checkout ─► ABIERTA / PENDIENTE / NO_PREPARADO
   pago aprobado (PAG-005) ─► ABIERTA / PAGADO / NO_PREPARADO
   crear envío (ENV-003)   ─► ABIERTA / PAGADO / PREPARADO      (Envío CREADO)
   despachar               ─►                                   (Envío EN_TRANSITO)
   entregar (ENV-004/005)  ─► CERRADA / PAGADO / ENTREGADO      (Envío ENTREGADO)
```
Producto digital: pago aprobado ⇒ `ENTREGADO` y `CERRADA` de inmediato.

## Caminos alternativos
| Situación | Resultado | Efectos |
|---|---|---|
| Vence sin pago (tarea, ORD-008) | `CANCELADA / ANULADO / NO_PREPARADO` | libera reserva (INV-005), devuelve uso de cupón, audita `PAGO_VENCIDO` |
| Personal cancela sin pago | igual que arriba con su motivo | ídem |
| Personal cancela pagada sin preparar | `CANCELADA / REEMBOLSADO` | reembolso total (PAG-007), reposición opcional (INV-006), balance (BAL-002) |
| Reembolso parcial tras entrega | `CERRADA / PARCIALMENTE_REEMBOLSADO / ENTREGADO` | balance; reposición opcional |
| Pago llega tras anular (PAG-006) | orden sigue `CANCELADA`; pago `APROBADO` marcado para reembolso | auditoría + aviso al personal |

## Transacciones
- **Confirmación de pago**: una transacción (orden + inventario + balance + comisión). Efectos de correo después del commit.
- **Cancelación pagada**: (1) llamar a la pasarela para el reembolso **fuera** de la transacción (PAG-010); (2) si aprueba, una transacción con pago `REEMBOLSO`, estados, inventario, balance y auditoría. Si la pasarela falla, la orden no cambia y se informa el error.

## Invariantes
- `EstadoPago` solo lo cambia pagos; `EstadoPreparacion` solo envíos; `Estado` solo órdenes.
- Reembolsado acumulado ≤ cobrado.
- Una orden `CANCELADA` no vuelve a `ABIERTA`.

## Pruebas del flujo
- Camino feliz con envío y con producto digital.
- Vencimiento: crear orden, adelantar reloj (`Clock` inyectable), correr tarea → reserva liberada.
- Cancelación pagada con fallo simulado de pasarela → orden intacta.
