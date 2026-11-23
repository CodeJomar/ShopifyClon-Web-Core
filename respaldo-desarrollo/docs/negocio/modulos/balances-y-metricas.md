# Módulo: balances y métricas

## Propósito
Dar al comerciante cifras rápidas sin recorrer todas las órdenes, y a la plataforma lo que ha ganado por comisiones.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `BalancesTienda` | `TotalVentasHistorico` (bruto cobrado), `TotalReembolsado` (nuevo), `TotalComisiones` (nuevo), `CantidadOrdenes` (pagadas), `SaldoPendienteCobro` | uno por tienda |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| BAL-001 | Al confirmar un pago (PAG-005): `TotalVentasHistorico += Total`, `TotalComisiones += Comision`, `CantidadOrdenes += 1`, `SaldoPendienteCobro += Total − Comision`. | servicio (misma transacción, `UPDATE` relativo) |
| BAL-002 | Al reembolsar `m`: `TotalReembolsado += m`, `SaldoPendienteCobro −= m`. La comisión no se devuelve en v1 (Q-014). | servicio |
| BAL-003 | Solo pagos escribe el balance, mediante el puerto `BalancePuerto`. Nadie lo edita a mano. | arquitectura |
| BAL-004 | Debe poder **reconstruirse** desde `Pagos` y `Ordenes` (consulta de verificación para pruebas). | prueba |
| MET-001 | Panel: ventas netas, órdenes y ticket promedio por día en un rango (máx. 366 días), en la zona horaria de la tienda; top 5 productos por unidades; órdenes por preparar. | consulta de solo lectura |

## Permisos
`METRICAS_VER`. El admin de plataforma ve solo totales de comisiones por tienda.
