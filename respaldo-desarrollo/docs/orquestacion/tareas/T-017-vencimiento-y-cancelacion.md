# T-017 — Vencimiento de órdenes impagas y cancelación sin pago

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-017-cancelacion` desde `develop` |
| Depende de | T-015 |
| Tamaño | M |

## Objetivo
Anular órdenes `PENDIENTE` vencidas (ORD-008) y permitir al personal cancelar órdenes no pagadas (ORD-007), liberando stock y devolviendo el uso del cupón (D-020).

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/ordenes.md` → ORD-007, ORD-008
- `docs/negocio/flujos/ciclo-de-vida-orden.md` → "Caminos alternativos"
- Código: `OrdenServicio.bloquear` / `anular` (T-015), `InventarioServicio.liberar`, `CuponServicio.devolverUso`, `AuditoriaServicio`; imitar `modulos/suscripcion/programador/SuscripcionProgramador` (cron, bandera, lotes con `SKIP LOCKED`).

## Alcance (todo en `modulos/pago/`, que orquesta la cancelación según la arquitectura)
1. `CancelacionOrdenServicio.anularSinPago(tiendaId, ordenId, motivo, detalle)` (`MANDATORY`): `bloquear` → exige `ABIERTA` + `PENDIENTE` + `NO_PREPARADO` → `inventario.liberar(items)` → si hay `cuponId`, `cupones.devolverUso` → `ordenes.anular` → audita `ORDEN_CANCELADA` (detalle: motivo) → publica `OrdenCanceladaEvento`.
2. `POST /panel/ordenes/{ordenId}/cancelar` con `@RequierePermiso(ORDENES_CANCELAR)`: request `motivo` (`CLIENTE`|`FRAUDE`|`SIN_STOCK`|`OTRO`), `detalle?` (≤255; obligatorio si `OTRO`). Orden pagada → 409 `ORD-007` "Para cancelar una orden pagada emite un reembolso" (T-019 lo resolverá). Ya preparada o cancelada → 409 `ORD-007`.
3. `OrdenVencimientoProgramador` (`@Scheduled`, cron `${app.programador.ordenes.cron:0 */5 * * * *}`, misma bandera `app.programador.habilitado`; método público `ejecutar()`): toma con consulta nativa `FOR UPDATE SKIP LOCKED` por lotes de 50 las órdenes `ABIERTA` + `PENDIENTE` con `FechaExpiracionPago < ahora` (índice `IdxOrdenesPendientesExpiracion`) y aplica `anularSinPago(…, "PAGO_VENCIDO", null)`, una orden por transacción.

## Criterios de aceptación (con pruebas; órdenes creadas con el checkout real)
- [ ] Cancelar una orden pendiente → `CANCELADA` / `ANULADO`; reserva liberada (movimiento `LIBERACION`); el cupón recupera su uso; auditoría con motivo.
- [ ] Cancelar una orden pagada → 409 `ORD-007`; motivo `OTRO` sin detalle → 422.
- [ ] Programador: orden vencida (mueve `FechaExpiracionPago` con jdbc) → anulada con motivo `PAGO_VENCIDO`; una no vencida queda igual; ejecutar dos veces no hace nada más.
- [ ] `GESTOR_CATALOGO` → 403; orden de otra tienda → 404.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
