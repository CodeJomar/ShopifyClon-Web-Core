# T-015 — Módulo `pago`: pago manual, confirmación de pago, balance y transiciones de la orden

| Campo | Valor |
|---|---|
| Modelo | Sonnet (revisión estricta) |
| Rama | `tarea/T-015-pagos` desde `develop` |
| Depende de | T-014 |
| Tamaño | L |

## Objetivo
Registrar pagos manuales y ejecutar la **confirmación de pago** (PAG-005) en una transacción. Además, dejar en `OrdenServicio` **todas** las transiciones de estado de la orden que usarán T-016…T-020, para que esas tareas corran en paralelo sin tocar el mismo archivo.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/pagos.md` (PAG-001, 004, 005, 006, 009, 010), `ordenes.md` (ORD-004…006), `balances-y-metricas.md` (BAL-001…003), `suscripciones.md` (SUS-012)
- `docs/negocio/flujos/ciclo-de-vida-orden.md`
- Tabla `Pagos`: `database.sql` + columnas de V2 (`Tipo`, `PagoOrigenId`, `Referencia`, `Motivo`) y `ChkPagos*`
- Código: `modulos/orden/**`, `InventarioServicio.confirmarVenta`, `SuscripcionServicio.vigente`, `BalanceServicio`, `AuditoriaServicio`.

## Alcance
### 1. Transiciones en `OrdenServicio` (módulo `orden`, todas `MANDATORY`, con bloqueo `PESSIMISTIC_WRITE` de la orden y validando con `puedeTransicionarA` de cada enum)
| Método | Efecto | Error si no corresponde |
|---|---|---|
| `OrdenEstado bloquear(UUID tiendaId, UUID ordenId)` | record con id, estados, total, pasarela, `fechaExpiracionPago`, `cuponId`, `items (varianteId, cantidad, requiereEnvio)`, `requiereEnvio` | 404 `ORD-404` |
| `aplicarPagoConfirmado(ordenId, BigDecimal comision)` | `EstadoPago = PAGADO`, `ComisionPlataforma`; si ninguna línea requiere envío → `EstadoPreparacion = ENTREGADO`, `Estado = CERRADA`, `FechaCierre` | 409 `ORD-005` |
| `anular(ordenId, String motivo, String detalle)` | `EstadoPago = ANULADO`, `Estado = CANCELADA`, `FechaCancelacion` | 409 `ORD-007` |
| `marcarPreparada(ordenId)` | `NO_PREPARADO → PREPARADO` (solo con pago `PAGADO`, ORD-006) | 409 `ORD-006` |
| `marcarEntregada(ordenId)` | `PREPARADO → ENTREGADO`; si el pago es `PAGADO`/`PARCIALMENTE_REEMBOLSADO`/`REEMBOLSADO` → `CERRADA` + `FechaCierre` (ORD-004) | 409 `ORD-006` |
| `aplicarReembolso(ordenId, boolean total)` | `PARCIALMENTE_REEMBOLSADO` o `REEMBOLSADO` | 409 `ORD-005` |
| `cancelarPagada(ordenId, motivo, detalle)` | `Estado = CANCELADA` (el estado de pago lo fija `aplicarReembolso`) | 409 `ORD-007` |
Define los mapas de transición en los enums (`EstadoOrden`, `EstadoPago`, `EstadoPreparacion`) con pruebas unitarias de todas las combinaciones.

### 2. Balance (módulo `balance`, `MANDATORY`, `UPDATE` relativos con `@Modifying`)
- `registrarVenta(tiendaId, total, comision)` → BAL-001.
- `registrarReembolso(tiendaId, monto)` → BAL-002 (lo usará T-019).

### 3. Módulo `pago`
- `PagoEntidad` (todas las columnas), enums `TipoPago` (`CARGO`/`REEMBOLSO`) y `EstadoRegistroPago` (`PENDIENTE`/`APROBADO`/`RECHAZADO`); reutiliza `orden.modelo.PasarelaPago`.
- `ConfirmacionPagoServicio.confirmar(UUID tiendaId, UUID pagoId)` (`MANDATORY`) = PAG-005 en este orden: `ordenes.bloquear` → si `ANULADO` → PAG-006 (el pago queda `APROBADO`, la orden **no** cambia, audita `PAGO_TARDIO_RECIBIDO`, termina) → `inventario.confirmarVenta(items)` → comisión = `redondear(Total × PorcentajeComision)` del plan vigente (sin suscripción vigente → 0) → `aplicarPagoConfirmado` → `balance.registrarVenta` → publica `OrdenPagadaEvento(tiendaId, ordenId)`. Lo reutilizará el webhook de T-016.
- **Pago manual** (PAG-004): `POST /panel/ordenes/{ordenId}/pagos/manual` con `@RequierePermiso(ORDENES_GESTIONAR)`, request `referencia?` (≤100). Orden `ABIERTA` + `PENDIENTE` (si no → 409 `PAG-004`). Inserta `Pagos` `CARGO` `APROBADO`, `MANUAL`, `Monto = Total`, moneda de la tienda, `Referencia`; llama a `confirmar`; audita `PAGO_MANUAL_REGISTRADO`. Una orden vencida pero aún `PENDIENTE` se puede pagar.
- `GET /panel/ordenes/{ordenId}/pagos` (`ORDENES_VER`): pagos y reembolsos de la orden (sin `DetallesRespuesta`).

## Criterios de aceptación (con pruebas; crea la orden con el checkout real de T-014)
- [ ] Pago manual de una orden con envío: pago `APROBADO`; orden `PAGADO` / `NO_PREPARADO` / `ABIERTA`; stock: `Disponible` y `Reservada` bajan; movimiento `VENTA`; comisión = 2 % con plan `BASICO`; balance (ventas, comisiones, cantidad, saldo) actualizado; auditoría.
- [ ] Orden solo digital pagada → `ENTREGADO` y `CERRADA`.
- [ ] Pagar dos veces → la segunda 409 `PAG-004`; orden `ANULADO` (jdbc) → 409.
- [ ] `confirmar` sobre orden `ANULADO` (llamada directa) → pago aprobado, orden intacta, auditoría `PAGO_TARDIO_RECIBIDO`.
- [ ] Unitarias de los mapas de transición; cada método de `OrdenServicio` rechaza las transiciones inválidas.
- [ ] `GESTOR_CATALOGO` → 403; orden de otra tienda → 404 `ORD-404`.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
