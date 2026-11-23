# T-019 — Reembolsos y cancelación de órdenes pagadas

| Campo | Valor |
|---|---|
| Modelo | Sonnet (dinero: revisión estricta) |
| Rama | `tarea/T-019-reembolsos` desde `develop` |
| Depende de | T-016, T-017 |
| Tamaño | M |

## Objetivo
Reembolsos parciales y totales (manuales o por Stripe), con reposición opcional de stock, y cancelación de órdenes pagadas mediante reembolso total (ORD-007).

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/pagos.md` → PAG-006, PAG-007, PAG-008, PAG-010; `ordenes.md` → ORD-007; `inventario.md` → INV-006; `balances-y-metricas.md` → BAL-002
- `docs/negocio/flujos/ciclo-de-vida-orden.md` → "Transacciones" (cancelación pagada)
- `docs/negocio/08-preguntas-abiertas.md` → Q-013 y Q-014 (aplica sus valores por defecto)
- Código: `modulos/pago/**` (sobre todo `PasarelaEnLinea`, `StripePasarela`, `CancelacionOrdenServicio`, el patrón de `WebhookStripeServicio`), `OrdenServicio.bloquear` / `aplicarReembolso` / `cancelarPagada`, `InventarioServicio.reponer`, `BalanceServicio.registrarReembolso`.

## Alcance
1. **Pasarela**: agrega a `PasarelaEnLinea` el método `ResultadoReembolso reembolsar(String intentoId, long montoCentavos)` (record con `id`, `aprobado`). Impleméntalo en `StripePasarela` (`Refund.create` con `payment_intent` y `amount`) y en la pasarela falsa de pruebas (aprueba salvo un monto que termine en `.13`, para simular rechazo).
2. **`ReembolsoServicio.reembolsar(tiendaId, ordenId, monto, motivo, List<LineaReposicion> reponer)`**, con el patrón de PAG-010:
   - **T1**: bloquea la orden; exige pago `PAGADO` o `PARCIALMENTE_REEMBOLSADO` (si no → 409 `PAG-007`); `disponible = Σ cargos APROBADO − Σ reembolsos APROBADO o PENDIENTE` de la orden; `monto` > 0, con 2 decimales y ≤ `disponible` (si no → 422 `PAG-007` indicando el máximo); valida la reposición (cada variante debe ser de la orden y la cantidad ≤ vendida − ya repuesta: suma de movimientos `REPOSICION` de esa orden, leída con una consulta nativa de solo lectura); inserta `Pagos` `REEMBOLSO` `PENDIENTE` con `PagoOrigenId` = el cargo aprobado y `Motivo`.
   - **Fuera de transacción**: si el cargo es `STRIPE`, `pasarela.reembolsar(transaccionDelCargo, centavos)`. Si es `MANUAL`, no hay llamada (el dinero se devuelve por fuera).
   - **T2**: si se rechazó → reembolso `RECHAZADO` y 409 `PAG-007` "La pasarela rechazó el reembolso"; la orden no cambia. Si se aprobó → reembolso `APROBADO` → `ordenes.aplicarReembolso(ordenId, total = Σ reembolsos aprobados == Σ cargos)` → `inventario.reponer(lineas, motivo)` si hay → `balance.registrarReembolso` (BAL-002; la comisión no se devuelve, Q-014) → audita `REEMBOLSO_EMITIDO` (monto, motivo, reposición).
   - Un fallo de red de la pasarela deja el reembolso `RECHAZADO` (no `PENDIENTE` para siempre).
3. **Endpoint**: `POST /panel/ordenes/{ordenId}/reembolsos` con `@RequierePermiso(REEMBOLSOS_EMITIR)`; request `monto`, `motivo` (5–255), `reponer[]?` (`variante_id`, `cantidad` > 0). Respuesta: el reembolso creado y el estado de pago de la orden.
4. **Cancelación pagada (ORD-007)**: extiende `POST /panel/ordenes/{ordenId}/cancelar` (T-017). Si la orden está pagada: exige que el contexto tenga `REEMBOLSOS_EMITIR` (si no → 403 `SEG-002`) y `NO_PREPARADO` (si no → 409 `ORD-007`); emite el reembolso **total pendiente** con reposición de **todas** las unidades salvo que el request traiga `reponer_stock = false`; luego `ordenes.cancelarPagada`; audita `ORDEN_CANCELADA`. Si la pasarela rechaza, la orden queda intacta (ciclo-de-vida-orden.md).
5. **Pago tardío (Q-013, revisión manual)**: una orden `ANULADO` con un cargo `APROBADO` (PAG-006) admite reembolsar ese cargo con el mismo endpoint: no se repone stock, no se toca el balance (nunca se sumó) y no cambia el estado de la orden; se audita igual.

## Criterios de aceptación (con pruebas; órdenes creadas con checkout y pagadas con pago manual o webhook falso)
- [ ] Reembolso parcial 60 de 100 → `PARCIALMENTE_REEMBOLSADO`; luego 40 → `REEMBOLSADO`; un tercero → 409 `PAG-007`; 50 + 60 sobre 100 → el segundo 422 con el máximo.
- [ ] Reembolso con reposición de 1 unidad → movimiento `REPOSICION` y `Disponible` +1; reponer más de lo vendido → 422.
- [ ] Balance: `TotalReembolsado` y `SaldoPendienteCobro` correctos; `TotalComisiones` no baja.
- [ ] Stripe falso: reembolso aprobado; monto terminado en `.13` → `RECHAZADO`, orden sin cambios.
- [ ] Cancelar pagada sin preparar → `CANCELADA` + `REEMBOLSADO` + stock repuesto; preparada → 409; con `GESTOR_PEDIDOS` (sin `REEMBOLSOS_EMITIR`) → 403.
- [ ] Orden no pagada → 409 `PAG-007`; otra tienda → 404 `ORD-404`.
- [ ] Pago tardío sobre orden anulada: se reembolsa sin tocar stock, balance ni estado de la orden.
- [ ] `mvn clean test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
