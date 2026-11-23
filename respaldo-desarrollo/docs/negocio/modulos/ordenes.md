# Módulo: órdenes

## Propósito
El contrato de venta: se crea en el checkout, congela precios y datos, y recorre tres ciclos independientes (orden, pago, preparación).

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Ordenes` | número, cliente (correo, nombre, teléfono), desglose financiero, `Estado`, `EstadoPago`, `EstadoPreparacion`, direcciones JSONB, cupón + `CodigoCupon`, `NombreTarifaEnvio`, `TasaImpuesto`, `ComisionPlataforma`, `ClaveIdempotencia`, `TokenAcceso`, `FechaExpiracionPago`, `FechaCancelacion`, `MotivoCancelacion` | número único por tienda; clave idempotencia única por tienda |
| `ItemsOrden` | instantánea de títulos, SKU, precio, cantidad, total de línea, `RequiereEnvio` | inmutable |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| ORD-001 | La orden solo la crea el checkout (flujo `checkout.md`). No hay endpoint de "crear orden" con montos desde el cliente. | arquitectura |
| ORD-002 | Desglose financiero e items son inmutables. `Total = Subtotal − DescuentoTotal + CostoEnvio (+ Impuestos si no incluidos)`; CHECK en BD. | servicio + CHECK |
| ORD-003 | Dirección de envío obligatoria si alguna línea requiere envío; la de facturación por defecto = envío. | servicio |
| ORD-004 | `Estado`: `ABIERTA → CERRADA` cuando pago ∈ {`PAGADO`, `PARCIALMENTE_REEMBOLSADO`, `REEMBOLSADO`} y preparación = `ENTREGADO` (automático) o manual por el personal. `ABIERTA → CANCELADA` por cancelación. `CERRADA → ABIERTA` (reabrir) manual. | servicio |
| ORD-005 | `EstadoPago`: `PENDIENTE → PAGADO` (cargo aprobado por el total); `PENDIENTE → ANULADO` (vence o se cancela sin pago); `PAGADO → PARCIALMENTE_REEMBOLSADO → REEMBOLSADO` según suma de reembolsos. Lo escribe solo el módulo de pagos. | servicio de pagos |
| ORD-006 | `EstadoPreparacion`: `NO_PREPARADO → PREPARADO → ENTREGADO`. Solo con pago `PAGADO` (Q-012: ¿permitir preparar contra entrega?). Lo escribe solo el módulo de envíos (D-010). | servicio de envíos |
| ORD-007 | Cancelar: solo si `EstadoPreparacion = NO_PREPARADO` y `Estado = ABIERTA`; motivo obligatorio (`CLIENTE`, `FRAUDE`, `SIN_STOCK`, `OTRO` + texto). Sin pago → pago `ANULADO`, libera reserva y devuelve uso del cupón. Pagada → exige `REEMBOLSOS_EMITIR`, emite reembolso total y repone stock si se marca. | servicio |
| ORD-008 | Vencimiento: órdenes `PENDIENTE` con `FechaExpiracionPago < ahora` → anuladas por tarea programada (como ORD-007 sin pago, motivo `PAGO_VENCIDO`). | tarea |
| ORD-009 | El número de orden se asigna en el checkout desde `Tiendas.SiguienteNumeroOrden` (TIE-007). | servicio |
| ORD-010 | `TokenAcceso` aleatorio (32+ bytes) permite al comprador invitado ver el estado de su orden sin sesión. | servicio |
| ORD-011 | Listado del panel: filtros por estado, estado de pago, preparación, rango de fechas, texto (número, correo, nombre); orden por fecha desc. | repositorio |
| ORD-012 | El comprador registrado ve solo sus órdenes (`UsuarioId`), de todas las tiendas o filtrando por una. | repositorio |

## Permisos
| Acción | Permiso |
|---|---|
| Listar / ver detalle | `ORDENES_VER` |
| Cerrar / reabrir | `ORDENES_GESTIONAR` |
| Cancelar no pagada / pagada | `ORDENES_CANCELAR` / `REEMBOLSOS_EMITIR` |
| Ver orden como comprador | dueño o `TokenAcceso` |

## Eventos y auditoría
- Tras commit: `OrdenCreadaEvento` (correo de confirmación al comprador y aviso a la tienda), `OrdenCanceladaEvento`, `OrdenPagadaEvento`.
- Auditar: cancelación, cierre/reapertura manual.
