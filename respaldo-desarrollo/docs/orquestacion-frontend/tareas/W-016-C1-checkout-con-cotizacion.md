# W-016-C1 — Checkout con la cotización de envío de la API (A-003)

| Campo | Valor |
|---|---|
| Ejecutor | Haiku, en el checkout principal (puerto 3000), con navegador |
| Rama | `tarea/W-016-C1-checkout-con-cotizacion` desde `develop` |
| Depende de | W-016 (web) y **A-003** (backend, mergeado en `72f7b9a`; el contenedor `api-core` debe estar reconstruido con ese commit) |
| Tamaño | S |

## Objetivo
Eliminar el `CHK-004` sistemático de las compras con envío: al elegir la tarifa, la web pide al carrito la cotización exacta y envía ese total como `total_esperado`. Así la primera confirmación crea la orden.

## Contrato nuevo (A-003)
- `GET /vitrina/{sub}/carrito?tarifa_envio_id={uuid}` → el `Carrito` de siempre con **`costo_envio`** y un **`total_estimado` que incluye el envío** (y sus impuestos), **idéntico** al que calcula el checkout.
- Sin el parámetro: igual que antes (`costo_envio` ausente).
- Tarifa inactiva, de otra tienda o inexistente → 409 `ENV-001`.
- Si ninguna línea requiere envío, el parámetro se ignora y `costo_envio` = 0.

## Cambios
- En `src/modules/checkout/` (y la acción del carrito si hace falta un parámetro opcional): al elegir o cambiar la tarifa, pedir el carrito con `tarifa_envio_id` y mostrar en el resumen subtotal, descuento, **envío**, impuestos y **total** **de esa respuesta**. Quitar el texto "Se calcula al confirmar".
- `total_esperado` = `total_estimado` de la cotización vigente. La clave de idempotencia sigue la regla de W-016: se renueva si cambia el total (por ejemplo, al cambiar de tarifa).
- **Conservar** el manejo de `CHK-004` (puede seguir ocurriendo si cambia un precio entre la cotización y la confirmación), pero ya no como camino normal.
- La web sigue **sin calcular** montos.

## Criterios de aceptación (con la API real, contenedor reconstruido)
- [ ] Compra como invitado con envío: el resumen muestra el costo de envío de la API y la **primera** confirmación crea la orden (201), **sin** `CHK-004`.
- [ ] Cambiar de tarifa (si hay dos activas) actualiza el envío y el total; con el monto de "gratis desde" alcanzado, el envío es 0.
- [ ] Compra de un producto que no requiere envío (si existe; si no, anotarlo) sin pedir tarifa.
- [ ] Provocar `CHK-004` cambiando un precio entre la cotización y la confirmación: sigue mostrando el mensaje y el nuevo total.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo y su resultado (**sin capturas**); órdenes de prueba anotadas.
- [ ] **No detener la API**.
