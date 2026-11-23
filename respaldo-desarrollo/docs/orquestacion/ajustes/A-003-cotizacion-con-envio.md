# A-003 — Cotización del carrito con envío (total exacto antes del checkout)

| Campo | Valor |
|---|---|
| Ejecutor | Sonnet (sesión del backend) |
| Repositorio | `ShopifyClon-Api-Core` |
| Rama | `ajuste/A-003-cotizacion-con-envio` desde `develop` |
| Origen | Revisión de W-016 (2026-10-21) |
| Bloquea | Que el checkout con envío no reciba siempre `CHK-004` en la primera confirmación |
| Tamaño estimado | S |

## Problema
El checkout compara `total_esperado` con el total de `CalculadoraTotales` **con envío** (paso 7 de `docs/negocio/flujos/checkout.md`). El carrito calcula con la misma calculadora pero con **`envio = null`** (`CarritoCalculoServicio`, CAR-005), y la web no puede calcular montos. Resultado: **toda compra con envío** recibe `409 CHK-004` en la primera confirmación y solo funciona al segundo intento (la web usa el total de `detalles`). No hay forma de conocer el total exacto antes de confirmar.

## Solución (compatible, sin romper contratos)
- `GET /vitrina/{subdominio}/carrito` acepta el parámetro opcional **`tarifa_envio_id`** (UUID).
  - Sin el parámetro: **igual que hoy** (sin envío).
  - Con el parámetro y alguna línea que requiere envío: la tarifa debe ser **activa y de la misma tienda** (si no → el mismo error que daría el checkout en el paso 5: `ENV-001`/404 según corresponda). Se pasa como `envio` a `CalculadoraTotales.calcular(...)`, **con exactamente los mismos datos que usa `CheckoutServicio`** (líneas vendibles, descuento del cupón, tarifa, regla `ENV-002` de envío gratis, configuración de impuestos de la tienda).
  - Si ninguna línea requiere envío, el parámetro se ignora (costo 0).
- `CarritoResponse` agrega **`costo_envio`** (nullable: `null` cuando no se pidió tarifa) y `total_estimado` pasa a incluir el envío (y sus impuestos, si aplican) cuando se envía `tarifa_envio_id`.
- **Garantía clave**: para el mismo carrito, cupón y tarifa, `total_estimado` de la cotización **es idéntico** al total que calcula el checkout. Extraer, si hace falta, un método común para armar las entradas de la calculadora y usarlo en los dos sitios (no duplicar la lógica).
- Actualizar `docs/negocio/modulos/carrito.md` (CAR-005) y la tabla de contratos que corresponda, y la anotación en Swagger.

## Fuera de alcance
- Cambiar el flujo del checkout o los códigos de error. La web (W-016) se adapta después en una tarea aparte.

## Criterios de aceptación (verificables)
- [ ] Prueba: sin `tarifa_envio_id`, la respuesta es la de antes (`costo_envio` nulo, mismo `total_estimado`).
- [ ] Prueba: con tarifa, `costo_envio` = precio de la tarifa y `total_estimado` incluye el envío; con subtotal (menos descuento) ≥ `monto_minimo_gratis`, `costo_envio` = 0 (ENV-002).
- [ ] Prueba **de igualdad**: con carrito con cupón y tarifa, el `total_estimado` de la cotización enviado como `total_esperado` al checkout **no** produce `CHK-004` (crea la orden 201), con impuesto incluido y no incluido.
- [ ] Prueba: tarifa inactiva o de otra tienda → error.
- [ ] `mvn -q test` en verde (pegar resumen).

## Reglas para el ejecutor
- Lee antes `docs/arquitectura-backend.md`, `docs/orquestacion/README.md` (reglas del backend), `docs/negocio/flujos/checkout.md`, `docs/negocio/modulos/carrito.md` y `envios.md`.
- Arquitectura por capas del proyecto (controlador/servicio/repositorio/entidad/dto/modelo). Commits "tipo(A-003): …", sin Co-Authored-By. Sin push ni merge.
- **No** reconstruir ni reiniciar el contenedor `api-core` (`docker compose …`): otro agente lo usa en paralelo. Verificar solo con las pruebas (`mvn -q test`); Opus actualiza el contenedor al mergear.
- Reporte en `docs/orquestacion/reportes/A-003.reporte.md` con la plantilla `docs/orquestacion/plantilla-reporte.md`.
