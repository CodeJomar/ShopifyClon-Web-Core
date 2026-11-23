# W-015 — Carrito de la vitrina (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Haiku, en el checkout principal (puerto 3000), con navegador |
| Rama | `tarea/W-015-carrito` desde `develop` (incluye W-014 vitrina y W-010 cupones) |
| Depende de | W-014, W-010 |
| Tamaño | M |

## Objetivo
El comprador agrega variantes al carrito desde la vitrina, cambia cantidades, quita líneas, aplica o quita un cupón y ve los totales que calcula la API. El carrito sobrevive a recargas (cookie por tienda) y se vincula a la cuenta al iniciar sesión. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Paso 0 — datos y verificación pendiente de W-014
En el panel de "Tienda W006 Prueba" publica un producto que tenga imagen ("Taza W008 Prueba" o "Plato W008 UI"). Luego verifica en la vitrina lo que W-014 no pudo probar: la portada y el catálogo listan el producto; filtros y orden; el detalle muestra las variantes y el precio. Anótalo en el reporte, en su propia sección.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` (reglas 1–3) y `docs/negocio/modulos/carrito.md` (CAR-001…009), `docs/negocio/modulos/cupones.md` (CUP-005, CUP-006)
- Código: `src/app/api/[...ruta]/route.ts` y `src/lib/sesion/cookies.ts` (proxy y cookies, W-003), `src/modules/vitrina/` y `src/app/(vitrina)/tienda/[subdominio]/` (W-014; el botón "Agregar al carrito" y el ícono del carrito tienen `TODO(W-015)`), `src/modules/auth/views/login-view.tsx`

## Contrato de la API (verificado por Opus; públicas; JSON en `snake_case`; el token va en la cabecera `X-Carrito-Token`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Crear carrito | `POST /vitrina/{sub}/carrito` | → `Carrito` con `token` nuevo |
| Ver | `GET /vitrina/{sub}/carrito` | `Carrito` |
| Agregar | `POST /vitrina/{sub}/carrito/items` | `{ variante_id, cantidad }` → `Carrito` |
| Cambiar cantidad | `PUT /vitrina/{sub}/carrito/items/{varianteId}` | `{ cantidad }` (0 = quitar) |
| Quitar línea | `DELETE /vitrina/{sub}/carrito/items/{varianteId}` | → `Carrito` |
| Aplicar / quitar cupón | `PUT /vitrina/{sub}/carrito/cupon` `{ codigo (≤ 50) }` · `DELETE /vitrina/{sub}/carrito/cupon` | → `Carrito` · si no aplica, la API responde el motivo (CUP-006) |
| Vincular a la cuenta | `POST /vitrina/{sub}/carrito/vincular` (con sesión) | fusión al iniciar sesión (CAR-007) |

`Carrito = { token, estado, moneda, items: [{ variante_id, producto_id, titulo_producto, titulo_variante, url_imagen?, precio_unitario, cantidad, total_linea, disponible, requiere_envio }], cupon?: { codigo, descuento }, subtotal, descuento_total, impuestos_total, total_estimado, requiere_envio, advertencias: [{ codigo, mensaje, variante_id? }] }`.
Reglas: tope 99 por línea y 50 líneas (CAR-003); las advertencias (`CAR-004` stock, `CAR-006` variante no disponible) **no son errores**: se muestran en el carrito; carrito ya convertido → 409 `CAR-008` (crear uno nuevo). **La web nunca calcula montos**: muestra los de la API.

## Token del carrito en cookie (cambio en el proxy)
- El token se guarda en una cookie **`httpOnly`** por tienda: `otemu_carrito_{subdominio}` (`SameSite=Lax`, `Path=/`, `Secure` en producción, 30 días). Agregar las funciones en `src/lib/sesion/cookies.ts`.
- En `src/app/api/[...ruta]/route.ts`, para rutas `vitrina/{sub}/carrito…`:
  - si existe la cookie de esa tienda, el proxy agrega `X-Carrito-Token` (y deja de copiar esa cabecera desde el navegador);
  - cuando la respuesta trae `datos.token` (al crear el carrito), el proxy fija la cookie (el token puede quedar en el cuerpo: no da acceso a nada más que a ese carrito);
  - ante 409 `CAR-008` o 404 del carrito, borra la cookie para que el cliente cree uno nuevo.
- Validar `{sub}` con el mismo formato de subdominio que usa `modules/vitrina` antes de componer el nombre de la cookie.

## Pantallas y flujos
- **Detalle de producto**: "Agregar al carrito" se activa con la variante elegida y un selector de cantidad (1–99). Si no hay carrito, se crea primero. Al agregar: toast con "Ver carrito". Si la variante no está disponible, el botón queda desactivado.
- **Encabezado de la vitrina**: el ícono del carrito lleva a `/tienda/{sub}/carrito` y muestra la cantidad total de unidades.
- **`/tienda/{sub}/carrito`**: líneas (imagen, producto, variante, precio unitario, cantidad editable, total de línea, quitar); campo de cupón con aplicar/quitar y el mensaje de la API si no aplica; resumen con subtotal, descuento, impuestos y **total estimado** de la API (`formatearDinero` con `carrito.moneda`); advertencias en un `Alert`; vacío: "Tu carrito está vacío" con "Seguir comprando"; botón "Continuar con la compra" desactivado con `TODO(W-016)`.
- **Vinculación**: tras un login exitoso (`login-view.tsx`), si existe una cookie de carrito de alguna tienda, llamar `POST /vitrina/{sub}/carrito/vincular` (mejor esfuerzo: si falla, no bloquear el login). Si `siguiente` apunta a una tienda, vincular esa.

## Reglas
- No crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Código nuevo en `src/modules/carrito/`, `src/dtos/carrito/` y la ruta del carrito.
- Errores: el `mensaje` de la API en toast o `Alert`; el cupón inválido, junto al campo.

## Fuera de alcance
- Checkout y pago (W-016). Pulido visual.

## Criterios de aceptación (con la API real, en `tienda-w006-prueba`)
- [ ] Paso 0 hecho y anotado.
- [ ] Agregar un producto, recargar la página: el carrito sigue ahí; `document.cookie` **no** muestra `otemu_carrito_…`.
- [ ] Cambiar la cantidad, poner una cantidad mayor al stock (aparece la advertencia, no un error), quitar la línea.
- [ ] Aplicar el cupón `DESC15` (activo, de W-010): el descuento aparece en el resumen; aplicar `DESC20` (inactivo) muestra el motivo de la API; quitar el cupón.
- [ ] Iniciar sesión desde la vitrina con un carrito anónimo: se vincula sin romper el login.
- [ ] Los totales mostrados coinciden con los de la respuesta de la API.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo probado y su resultado (**sin capturas**).
- [ ] **No detener la API** al terminar (Antigravity trabaja en paralelo).
