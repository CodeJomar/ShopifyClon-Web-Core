# Flujo: checkout (carrito → orden)

## Objetivo y actores
Convertir un carrito en una orden con totales calculados por el servidor, stock reservado y número asignado, de forma idempotente. Actor: comprador (invitado o registrado).

## Precondiciones
- Tienda operativa (TIE-004); carrito `ACTIVO` con ≥ 1 línea vendible.

## Entrada
`POST /vitrina/{subdominio}/checkout` con `X-Carrito-Token`, `Idempotency-Key` (UUID; falta o inválido → 400 `CHK-007`) y cuerpo: correo, nombre, teléfono, dirección de envío (obligatoria si alguna línea requiere envío), dirección de facturación (opcional; por defecto la de envío), `tarifa_envio_id` (si aplica), `pasarela` (`MANUAL`/`STRIPE`), `total_esperado`. Si hay sesión, la orden guarda `UsuarioId`.

## Pasos
| # | Acción | Error | Transacción |
|---|---|---|---|
| 1 | Buscar orden por (`TiendaId`, `ClaveIdempotencia`). Si existe y es de **este** carrito (`Carritos.OrdenId`) → 200 con esa orden. Si es de otro carrito → 409 `CHK-006`. | — | lectura |
| 2 | Tienda operativa. | 409 `CHK-001` | **T1** inicia |
| 3 | Bloquear el carrito (`FOR UPDATE`); debe estar `ACTIVO`. | 404 `CAR-404`, 409 `CAR-008` | T1 |
| 4 | Variantes vendibles del carrito con precios actuales; descartar las no vendibles. Ninguna → error. | 409 `CHK-002` | T1 |
| 5 | Si alguna línea requiere envío: dirección de envío obligatoria y tarifa activa de la tienda. | 422 `VAL-001`; 409 `ENV-001` | T1 |
| 6 | Revalidar el cupón del carrito (CUP-003). Si dejó de aplicar → error. | 409 `CHK-005` | T1 |
| 7 | `CalculadoraTotales` y comparar con `total_esperado`. Distinto → error con el carrito recalculado en `detalles`. | 409 `CHK-004` | T1 |
| 8 | Tomar número: `UPDATE "Tiendas" … SiguienteNumeroOrden + 1 … RETURNING` (bloquea la fila de la tienda). | — | T1 |
| 9 | Insertar `Ordenes` (`ABIERTA` / `PENDIENTE` / `NO_PREPARADO`, `TokenAcceso`, `FechaExpiracionPago` según pasarela D-003, instantáneas) e `ItemsOrden`. | — | T1 |
| 10 | Reservar stock con el id de la orden (INV-002, filas bloqueadas en orden de `VarianteId`). | 409 `INV-002` | T1 |
| 11 | Consumir el uso del cupón (CUP-007). | 409 `CHK-005` | T1 |
| 12 | Marcar el carrito `CONVERTIDO` con `OrdenId`; publicar `OrdenCreadaEvento`. | — | T1 → **commit** |
| 13 | Responder 201 (número, totales, `token_acceso`, siguiente paso de pago). Si una carrera violó `UxOrdenesClaveIdempotencia`, se relee la orden ganadora (fuera de T1) y se responde como en el paso 1. | — | — |

**Orden de bloqueo** (contrato, no se altera): carrito → tienda (número) → inventario (por `VarianteId`) → cupón. Cualquier error dentro de T1 deshace todo, incluido el número de orden (no quedan huecos).

## Estados que atraviesa
Carrito `ACTIVO → CONVERTIDO`; orden nace `ABIERTA / PENDIENTE / NO_PREPARADO`.

## Invariantes
- Una clave de idempotencia ⇒ como máximo una orden; un carrito ⇒ como máximo una orden.
- Suma de `CantidadReservada` = cantidades de órdenes `PENDIENTE` no vencidas (variantes que rastrean).
- Ningún monto proviene del cliente.

## Pruebas del flujo
- Feliz con cupón y envío (impuesto incluido y no incluido); misma clave dos veces; dos carritos por la última unidad; cambio de precio → `CHK-004`; cupón agotado → nada queda creado y el número no avanza.
