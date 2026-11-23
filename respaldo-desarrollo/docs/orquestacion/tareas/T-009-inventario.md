# T-009 — Módulo `inventario` completo

| Campo | Valor |
|---|---|
| Modelo | Sonnet (concurrencia: revisión estricta) |
| Rama | `tarea/T-009-inventario` desde `develop` |
| Depende de | T-008 |
| Tamaño | M |

## Objetivo
Ajuste manual de stock con motivo y auditoría, configuración de rastreo, historial de movimientos y las operaciones internas que usarán checkout y pagos: reservar, liberar, confirmar venta y reponer, sin sobreventa bajo concurrencia.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/inventario.md` (**fuente de verdad**: INV-001…009)
- `docs/negocio/04-reglas-de-integridad.md` → "Concurrencia e idempotencia"
- Código: `modulos/inventario/**` (ya existe la base de T-008: entidades, `crearInicial`, `disponibilidad`, `cantidades`), `comun/auditoria/AuditoriaServicio`.

## Alcance
### 1. Operaciones internas (`InventarioServicio`, todas `@Transactional(propagation = MANDATORY)`)
Entrada común: `UUID tiendaId`, `List<LineaInventario(UUID varianteId, int cantidad)>` (cantidades > 0; si una variante se repite, se suman), `UUID ordenId`.
| Método | Efecto por variante con `RastreaInventario = TRUE` | Movimiento |
|---|---|---|
| `reservar` | INV-002: si `!ventaSinStock` y `vendible < q` → acumula el faltante; si hay faltantes lanza **una** `ConflictoEstadoException("INV-002", …)` con `detalles.variantes = [{variante_id, solicitado, disponible}]` y no reserva nada. Si no, `Reservada += q` | `RESERVA` (`DeltaReservado = +q`) |
| `liberar` | `Reservada -= q` (si quedaría < 0 → `IllegalStateException`) | `LIBERACION` |
| `confirmarVenta` | `Disponible -= q`, `Reservada -= q` | `VENTA` |
| `reponer(…, String motivo)` | `Disponible += q` | `REPOSICION` |
- INV-003: variantes con `RastreaInventario = FALSE` se ignoran (sin cambios ni movimientos).
- INV-009: una sola consulta `@Lock(PESSIMISTIC_WRITE)` que bloquea todas las filas **ordenadas por `VarianteId`** antes de decidir.
- Cada movimiento guarda `TiendaId`, `OrdenId`, deltas y `DisponibleResultante` / `ReservadoResultante`.
- Una variante sin fila de inventario o de otra tienda → `RecursoNoEncontradoException("INV-404", …)`.

### 2. Panel
| Ruta | Permiso | Request | Regla |
|---|---|---|---|
| `PUT /panel/inventario/variantes/{varianteId}` | `INVENTARIO_AJUSTAR` | `nueva_cantidad` (≥ 0), `motivo` (5–255) | INV-007: bloquea la fila; `nueva_cantidad < Reservada` → 422 `INV-007`; movimiento `AJUSTE` con el delta; audita `INVENTARIO_AJUSTADO` (antes/después). Sin cambio → 200 sin movimiento |
| `PUT /panel/inventario/variantes/{varianteId}/configuracion` | `INVENTARIO_AJUSTAR` | `rastrea_inventario`, `permitir_venta_sin_stock` | desactivar la venta sin stock con `Disponible < 0` → 422 `INV-007` |
| `GET /panel/inventario/variantes/{varianteId}` | `INVENTARIO_AJUSTAR` | — | cantidades (`disponible`, `reservada`, `vendible`) y configuración |
| `GET /panel/inventario/variantes/{varianteId}/movimientos?pagina=&desde=&hasta=` | `INVENTARIO_AJUSTAR` | — | paginado 20, más recientes primero |
- La variante debe ser de la tienda del contexto: compruébalo con una consulta nativa de solo lectura (`VariantesProducto` → `Productos."TiendaId"`, ambos no eliminados); si no → 404 `INV-404`.

## Criterios de aceptación (con pruebas)
- [ ] Reservar 2 de 5 → vendible 3, un movimiento `RESERVA`; confirmar venta → disponible 3, reservada 0, movimiento `VENTA`; liberar después de reservar deja todo como al inicio.
- [ ] Reservar más del vendible → 409 `INV-002` con `detalles` y **sin** cambios en ninguna variante de la lista; con `permitir_venta_sin_stock` sí reserva.
- [ ] Variante que no rastrea: ninguna operación crea movimientos.
- [ ] **Concurrencia**: 2 hilos reservan la última unidad a la vez (cada uno en su `TransactionTemplate`, arrancando juntos con un `CountDownLatch`) → exactamente uno lo logra, el otro recibe `INV-002`.
- [ ] Ajuste: a 2 con 3 reservadas → 422 `INV-007`; ajuste válido crea movimiento `AJUSTE` y auditoría con motivo; sin motivo → 422 `VAL-001`.
- [ ] `GESTOR_PEDIDOS` → 403; variante de otra tienda → 404 `INV-404`.
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` pasa; commits sin coautor.
