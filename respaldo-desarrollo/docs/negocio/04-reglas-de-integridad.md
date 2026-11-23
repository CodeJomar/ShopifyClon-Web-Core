# Reglas de integridad

Lo que el sistema garantiza **siempre**, decidido por el servidor y respaldado por la base de datos.

## Dinero y cantidades
- Montos en `DECIMAL(12,2)` (balances `14,2`) y `BigDecimal` en Java. **Nunca** `double`/`float`.
- Redondeo `HALF_UP` a 2 decimales **por línea**; los totales suman líneas ya redondeadas.
- Moneda: la de la tienda (`Tiendas.Moneda`, ISO 4217). Una tienda opera en una sola moneda; no se cambia si ya tiene órdenes (TIE-005).
- Quién calcula subtotal, descuento, envío, impuestos y total: **solo el servidor**. El cliente envía lo que espera pagar (`total_esperado`) y si no coincide se responde 409 con el carrito recalculado (CHK-004).
- Fórmula única (en un solo componente, `CalculadoraTotales`):
  - `Subtotal = Σ (PrecioUnitario × Cantidad)`
  - `DescuentoTotal = descuento del cupón sobre Subtotal`, con tope `Subtotal`
  - `CostoEnvio = tarifa elegida` (0 si ninguna línea requiere envío, si la tarifa da envío gratis por monto o si el cupón es `ENVIO_GRATIS`)
  - Si la tienda tiene `PreciosIncluyenImpuesto = TRUE`: `ImpuestosTotal = (Subtotal − DescuentoTotal) − (Subtotal − DescuentoTotal) / (1 + TasaImpuesto)` (informativo) y `Total = Subtotal − DescuentoTotal + CostoEnvio`.
  - Si es `FALSE`: `ImpuestosTotal = (Subtotal − DescuentoTotal) × TasaImpuesto` y `Total = Subtotal − DescuentoTotal + CostoEnvio + ImpuestosTotal`.
  - El envío no lleva impuesto en la primera versión (D-012).
- Límites: cantidad por línea 1–99; máximo 50 líneas por carrito; total de orden ≤ 999 999 999,99.
- Instantáneas al crear la orden: título de producto y variante, SKU, precio unitario, direcciones, nombre de la tarifa de envío, tasa de impuesto, código del cupón y comisión de plataforma.

## Estados (ciclos independientes que no se mezclan)
| Ciclo | Columna | Valores | Finales |
|---|---|---|---|
| Orden | `Ordenes.Estado` | `ABIERTA`, `CERRADA`, `CANCELADA` | `CANCELADA` |
| Pago de orden | `Ordenes.EstadoPago` | `PENDIENTE`, `PAGADO`, `PARCIALMENTE_REEMBOLSADO`, `REEMBOLSADO`, `ANULADO` | `REEMBOLSADO`, `ANULADO` |
| Preparación | `Ordenes.EstadoPreparacion` | `NO_PREPARADO`, `PREPARADO`, `ENTREGADO` | `ENTREGADO` |
| Envío | `Envios.Estado` | `CREADO`, `EN_TRANSITO`, `ENTREGADO`, `DEVUELTO` | `ENTREGADO`, `DEVUELTO` |
| Suscripción | `SuscripcionesTienda.Estado` | `PRUEBA`, `ACTIVA`, `VENCIDA`, `CANCELADA`, `SUSPENDIDA` | `CANCELADA` |
| Carrito | `Carritos.Estado` | `ACTIVO`, `CONVERTIDO` | `CONVERTIDO` |

- Cada ciclo tiene **un mapa único de transiciones** en código (enum con `puedeTransicionarA`), documentado en su módulo. Una transición no permitida responde 409.
- `EstadoPreparacion` solo lo escribe el módulo de envíos/preparación (D-010).

## Propiedad y permisos
- Toda consulta y escritura del panel filtra por `TiendaId` del contexto validado (SEG-001); jamás por un `TiendaId` del cuerpo de la petición.
- Acciones que exigen **motivo** y auditoría: ajuste manual de inventario, cancelación de orden, reembolso, cambio de rol, quitar personal, suspensión de tienda, cambio de plan.

## Inmutabilidad
- `ItemsOrden` y el desglose financiero de `Ordenes` no se editan tras crearse.
- `Pagos`, `MovimientosInventario`, `CobrosSuscripcion` y `RegistroAuditoria` son **solo-añadir**: no se actualizan importes ni se eliminan. Un reembolso es una fila nueva `Tipo = REEMBOLSO`.
- La única actualización permitida en `Pagos` es el `Estado` de un intento `PENDIENTE` cuando llega su confirmación (webhook).
- Las correcciones se hacen con movimientos de ajuste con motivo obligatorio.

## Unicidad y exclusividad
- Correo de usuario único (sin distinguir mayúsculas).
- Subdominio único en la plataforma (minúsculas, `^[a-z0-9](-?[a-z0-9])*$`, 3–63 caracteres, lista de reservados: `www`, `api`, `admin`, `app`, `panel`).
- Por tienda (entre no eliminados): slug de categoría, slug de producto, **SKU de variante**, código de cupón (mayúsculas), número de orden.
- Una sola suscripción **no cancelada** por tienda.
- Un solo carrito `ACTIVO` por (tienda, usuario) registrado.
- Un rol por (tienda, usuario).
- Una dirección principal por usuario; una imagen principal por producto.
- Un pago por (pasarela, `TransaccionId`).

## Concurrencia e idempotencia
- **Checkout** exige encabezado `Idempotency-Key`; misma clave + misma tienda devuelve la misma orden (`Ordenes.ClaveIdempotencia`).
- **Webhooks** de pasarela: idempotentes por (`PasarelaPago`, `TransaccionId`).
- **Reserva de stock**: `SELECT … FOR UPDATE` sobre `InventarioVariante` ordenado por `VarianteId` (evita interbloqueos).
- **Uso de cupón**: `UPDATE … SET CantidadUsosActual = CantidadUsosActual + 1 WHERE … AND (LimiteUsosTotal IS NULL OR CantidadUsosActual < LimiteUsosTotal)`; 0 filas = cupón agotado.
- **Número de orden**: `UPDATE "Tiendas" SET "SiguienteNumeroOrden" = "SiguienteNumeroOrden" + 1 … RETURNING` dentro de la transacción del checkout.
- **Balance**: actualizaciones relativas (`SET x = x + :delta`), nunca leer-modificar-escribir.

## Retención y privacidad
- `ContrasenaHash` con BCrypt; los tokens de seguridad se guardan **hasheados** (SHA-256) y expiran (activación 24 h, recuperación 30 min).
- Nunca se registran en logs contraseñas, tokens, ni el cuerpo crudo de webhooks con datos de tarjeta.
- Las órdenes conservan nombre, correo y direcciones como instantánea (necesario para el comprobante). Eliminar un usuario no borra sus órdenes (`UsuarioId` → NULL).
- Datos de tarjeta: nunca pasan por el backend; la pasarela los tokeniza.
