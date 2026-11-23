# W-016 — Checkout idempotente y estado de la orden (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Haiku, en el checkout principal (puerto 3000), con navegador |
| Rama | `tarea/W-016-checkout` desde `develop` (incluye W-015 carrito y W-010 tarifas) |
| Depende de | W-015, W-010 |
| Tamaño | L — **dinero e idempotencia: revisión estricta de Opus** |

## Objetivo
Desde el carrito, el comprador (invitado o con sesión) completa sus datos, la dirección de envío y la tarifa, confirma el **total que calculó la API** y crea la orden con **pago manual** (QW-006: el pago en línea es simulado/no se usa). Ve una página de confirmación con el número y el estado de la orden, accesible por un enlace con token. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/negocio/flujos/checkout.md` (**completo**: pasos, errores `CHK-*`, idempotencia) y `docs/negocio/modulos/carrito.md`, `envios.md` (ENV-001/002), `ordenes.md` (estado por token)
- `docs/arquitectura-frontend.md` (reglas 3 y 6: la clave de idempotencia y la web nunca calcula dinero)
- Código: `src/app/api/[...ruta]/route.ts` y `src/lib/sesion/cookies.ts` (proxy y cookie del carrito, W-015), `src/modules/carrito/`, `src/modules/vitrina/`, `src/shared/hooks/use-clave-idempotencia.ts`, `src/modules/cuenta/` (direcciones guardadas)

## Contrato de la API (verificado por Opus; públicas salvo lo indicado; JSON en `snake_case`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Tarifas activas | `GET /vitrina/{sub}/tarifas-envio` | lista de tarifas activas (confirmar forma en Swagger) |
| Crear la orden | `POST /vitrina/{sub}/checkout` con `X-Carrito-Token` (lo pone el proxy) e **`Idempotency-Key`** (UUID) | `{ correo_cliente (≤ 255), nombre_cliente (≤ 150), telefono_cliente? (≤ 30), direccion_envio?: Direccion, direccion_facturacion?: Direccion, tarifa_envio_id?, pasarela: "MANUAL", total_esperado }` → `{ orden_id, numero_orden, estado, estado_pago, moneda, items: [{ titulo_producto, titulo_variante, sku, precio_unitario, cantidad, total_linea }], subtotal, descuento_total, costo_envio, impuestos_total, total, pasarela, token_acceso, fecha_expiracion_pago? }` |
| Estado de la orden (invitado) | `GET /vitrina/{sub}/ordenes/{tokenAcceso}` | `OrdenPublica` (ver Swagger) |

`Direccion = { nombre_contacto (≤ 150), telefono? (≤ 30), direccion_linea1 (≤ 200), direccion_linea2? (≤ 200), ciudad (≤ 100), estado_provincia (≤ 100), codigo_postal (≤ 20), pais (≤ 60) }` (estos límites son los del checkout, no los de la cuenta).

Errores clave (ver `checkout.md`): `CHK-001` tienda no operativa · `CHK-002` nada vendible · **`CHK-004` el total cambió** (los `detalles` traen el carrito recalculado) · `CHK-005` el cupón dejó de aplicar · `CHK-007` falta o es inválida la `Idempotency-Key` · stock insuficiente al reservar · `ENV-001` falta tarifa cuando hay envío.

## Cambios en el proxy (con cuidado: código de seguridad)
- `subdominioDeCarrito` en `route.ts` hoy solo reconoce `vitrina/{sub}/carrito…`. El checkout (`vitrina/{sub}/checkout`) también necesita `X-Carrito-Token` desde la cookie: ampliar a `checkout`. **No** fijar ni borrar la cookie del carrito desde la respuesta del checkout salvo lo que diga la tarea.
- Tras un checkout exitoso el carrito queda `CONVERTIDO` (CAR-008): borrar la cookie `otemu_carrito_{sub}` en esa misma respuesta (2xx de `vitrina/{sub}/checkout`) para que el próximo "agregar" cree un carrito nuevo.

## Pantallas y flujos
- **`/tienda/{sub}/checkout`** (el botón "Continuar con la compra" del carrito deja de estar desactivado y lleva aquí):
  1. **Datos**: correo, nombre, teléfono (prellenados desde el perfil si hay sesión: `GET /api/cuenta/perfil`, mejor esfuerzo).
  2. **Envío** (solo si `carrito.requiere_envio`): dirección (con sesión, elegir una de `GET /api/cuenta/direcciones` o escribir una) y tarifa (`GET /vitrina/{sub}/tarifas-envio`; si no hay tarifas activas, avisar y no permitir continuar, ENV-001).
  3. **Resumen**: líneas, subtotal, descuento, impuestos y el **total que la API devolvió en el carrito**. El costo de envío final lo calcula la API al crear la orden: mostrar "Se calcula al confirmar" o el precio de la tarifa como referencia, **sin sumar en la web**.
  4. **Confirmar**: método de pago "Pago manual (transferencia / Yape)". Al enviar, `total_esperado` = el total que la web está mostrando según la API.
- **Idempotencia**: una `Idempotency-Key` (UUID, con `use-clave-idempotencia`) **por intento de compra**: se genera al entrar a confirmar y **se reutiliza** si el usuario reintenta tras un error de red o doble clic; se genera una nueva solo si cambió el carrito. El botón se desactiva mientras se envía.
- **`CHK-004`**: mostrar "El total cambió" con el nuevo total de `detalles`, refrescar el carrito y pedir confirmar de nuevo (con una clave nueva, porque cambió el carrito).
- **Éxito** → `/tienda/{sub}/orden/{tokenAcceso}`: número de orden, estado de pago "Pago pendiente", total, líneas, instrucciones para el pago manual (texto genérico con el correo de contacto de la tienda) y la fecha límite de pago si viene. Esta página lee `GET /vitrina/{sub}/ordenes/{tokenAcceso}` y sirve también como enlace para volver a consultar el estado.
- Errores: `mensaje` de la API en `Alert`; `validaciones` en los campos.

## Reglas
- No crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Código nuevo en `src/modules/checkout/`, `src/dtos/checkout/` y las rutas de la vitrina.
- La web **nunca** calcula ni suma montos: todo lo que se muestra sale de la API (`formatearDinero` con la moneda de la API).

## Fuera de alcance
- Pago en línea con Stripe (QW-006). Confirmar el pago manual (lo hace el comerciante en W-011). Pulido visual.

## Criterios de aceptación (con la API real, en `tienda-w006-prueba`)
Preparar: el responsable o Opus pueden necesitar **una tarifa de envío activa** en esa tienda (W-010 dejó la única inactiva): actívala desde `/panel/envios` y anótalo.
- [ ] Compra como invitado de "Plato W008 UI" con envío: llega a la página de la orden con número, "Pago pendiente" y el total; el ícono del carrito vuelve a 0 (cookie borrada).
- [ ] Doble clic o reintento con la **misma** `Idempotency-Key`: no se crean dos órdenes (verificar que el número es el mismo).
- [ ] `CHK-004`: provocarlo (por ejemplo, cambiar el precio de la variante en el panel con el checkout abierto) y ver el mensaje con el nuevo total.
- [ ] Con cupón `DESC15` aplicado en el carrito: la orden refleja el descuento de la API.
- [ ] Compra con sesión: datos prellenados y la orden aparece en `/cuenta/ordenes` (esto también cierra lo pendiente de W-005: lista con datos y detalle de orden).
- [ ] El enlace `/tienda/{sub}/orden/{token}` abierto en otra pestaña muestra el estado.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo probado y su resultado (**sin capturas**). Órdenes de prueba anotadas (número y token).
- [ ] **No detener la API** al terminar (Antigravity puede estar en paralelo).
