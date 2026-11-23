# Módulo: inventario

## Propósito
Saber cuántas unidades existen y cuántas están comprometidas, impedir la sobreventa y dejar rastro de cada cambio.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `InventarioVariante` | `CantidadDisponible` (físico), `CantidadReservada`, `RastreaInventario`, `PermitirVentaSinStock` | uno por variante; reservado ≥ 0 |
| `MovimientosInventario` (nuevo) | variante, tienda, `Tipo`, `Delta`, `DisponibleResultante`, `ReservadoResultante`, motivo, orden | solo-añadir |

Tipos de movimiento: `INICIAL`, `AJUSTE`, `RESERVA`, `LIBERACION`, `VENTA`, `REPOSICION` (por cancelación o devolución).

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| INV-001 | Stock vendible = `CantidadDisponible − CantidadReservada`. | componente de dominio |
| INV-002 | Reservar `q` exige vendible ≥ `q`, salvo `PermitirVentaSinStock` o `RastreaInventario = FALSE`. Si no alcanza → 409 `INV-002` indicando la variante y lo disponible. | servicio con `FOR UPDATE` |
| INV-003 | Variantes con `RastreaInventario = FALSE` no generan reservas ni movimientos de venta. | servicio |
| INV-004 | Pago aprobado: `Disponible −= q`, `Reservado −= q` (movimiento `VENTA`). | servicio (llamado por pagos) |
| INV-005 | Orden anulada antes de pagar: `Reservado −= q` (`LIBERACION`). | servicio |
| INV-006 | Orden pagada cancelada o reembolso con reposición: `Disponible += q` (`REPOSICION`) solo si quien cancela marca "reponer stock". | servicio |
| INV-007 | Ajuste manual: se envía la **nueva cantidad física** y un motivo obligatorio; se registra el delta. La nueva cantidad no puede ser menor que `CantidadReservada`. | servicio |
| INV-008 | Todo cambio de cantidades escribe un `MovimientoInventario` en la misma transacción. Las cantidades **solo** cambian por este módulo. | servicio |
| INV-009 | Bloqueos en orden ascendente de `VarianteId` para evitar interbloqueos entre checkouts. | repositorio |

## Permisos
| Acción | Permiso |
|---|---|
| Ver inventario y movimientos | `CATALOGO_GESTIONAR` o `INVENTARIO_AJUSTAR` |
| Ajustar | `INVENTARIO_AJUSTAR` |
| Reservar / liberar / vender / reponer | interno (otros módulos vía puerto `InventarioPuerto`) |

## Operaciones
| Operación | Entrada | Salida | Errores |
|---|---|---|---|
| Ajustar stock | variante, nueva cantidad, motivo | inventario | `INV-007` |
| Configurar rastreo / venta sin stock | flags | inventario | — |
| Listar movimientos | variante, rango de fechas | página | — |
| (interno) reservar, liberar, confirmarVenta, reponer | lista (variante, cantidad), ordenId | — | `INV-002` |

## Concurrencia
- `SELECT … FROM "InventarioVariante" WHERE "VarianteId" IN (…) ORDER BY "VarianteId" FOR UPDATE`.
- El ajuste manual también bloquea la fila.

## Pruebas asociadas
| Regla | Prueba |
|---|---|
| INV-002 | 2 checkouts simultáneos por la última unidad → uno 201, otro 409 |
| INV-007 | Ajustar a 2 con 3 reservadas → 422 |
| INV-008 | Ciclo reserva → venta deja 2 movimientos y cantidades correctas |

## Nota sobre el código actual
`AjustarStockVarianteCasoUso` hoy sobrescribe la cantidad sin bloqueo, sin motivo, sin movimiento y sin validar la tienda: se rehace con INV-007/008 y SEG-004.
