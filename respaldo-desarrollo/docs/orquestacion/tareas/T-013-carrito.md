# T-013 — Módulo `carrito`

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/T-013-carrito` desde `develop` |
| Depende de | T-009, T-012 |
| Tamaño | M/L |

## Objetivo
Carrito persistente para invitados y usuarios registrados, siempre recalculado con precios actuales, con cupón, advertencias y fusión al iniciar sesión. Sin reservas de stock (D-003).

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/carrito.md` (**fuente de verdad**: CAR-001…009)
- `docs/negocio/05-decisiones.md` → D-003, D-018, D-019
- `docs/negocio/modulos/cupones.md` → CUP-003, CUP-005, CUP-006
- Código a usar: `modulos/totales/modelo/CalculadoraTotales`, `CuponServicio.evaluar`, `InventarioServicio.disponibilidad`, `TiendaServicio.idOperativaPorSubdominio`, `comun/util/GeneradorToken`. Imitar la vitrina de `modulos/catalogo`.

## Alcance
### 1. Piezas en otros módulos (métodos públicos nuevos, con prueba)
- `catalogo`: `CatalogoVentaServicio.variantesParaVenta(UUID tiendaId, Collection<UUID> varianteIds)` → `Map<UUID, VarianteVendible>` con el record `VarianteVendible(varianteId, productoId, tituloProducto, tituloVariante, sku, precio, requiereEnvio, urlImagen, vendible)`. `vendible = true` solo si la variante y su producto no están eliminados y el producto está publicado, en esa tienda. También lo usará el checkout.
- `tienda`: `TiendaServicio.configuracionVenta(UUID tiendaId)` → record `ConfiguracionVenta(moneda, tasaImpuesto, preciosIncluyenImpuesto)`, si no existe ya.

### 2. Entidades y reglas
`CarritoEntidad` (`Carritos`: `TiendaId`, `UsuarioId`, `TokenSesion`, `CuponId`, `Estado` enum `ACTIVO`/`CONVERTIDO`, `OrdenId`) e `ItemCarritoEntidad` (`ItemsCarrito`: `CarritoId`, `VarianteId`, `Cantidad`).
- CAR-001: token `GeneradorToken.tokenUrl()`, viaja en el encabezado `X-Carrito-Token`. Token desconocido, de otra tienda o de un carrito eliminado → 404 `CAR-404`.
- CAR-002/003: solo variantes con `vendible = true` de la misma tienda (si no → 422 `CAR-002`); sumar cantidades con tope 99 (más → 422 `CAR-003`); cantidad 0 quita la línea; máximo 50 líneas (→ 422 `CAR-003`).
- CAR-008: carrito `CONVERTIDO` → 409 `CAR-008` en cualquier escritura.
- Un carrito con `UsuarioId` solo lo opera el token correcto (no hace falta sesión).

### 3. Respuesta (siempre recalculada: CAR-005/006, D-018)
`CarritoResponse`: `token`, `estado`, `moneda`, `items[]` (`variante_id`, `producto_id`, `titulo_producto`, `titulo_variante`, `url_imagen`, `precio_unitario`, `cantidad`, `total_linea`, `disponible`, `requiere_envio`), `cupon { codigo, descuento }` o nulo, `subtotal`, `descuento_total`, `impuestos_total`, `total_estimado`, `requiere_envio`, `advertencias[] { codigo, mensaje, variante_id? }`.
- Cálculo con `CalculadoraTotales` y envío `null` (el envío se elige en el checkout). Mapea `TipoDescuento` → `TipoDescuentoAplicado`.
- Líneas no vendibles: fuera del cálculo, con advertencia `CAR-006` (siguen en el carrito hasta que el comprador las quite).
- Cantidad mayor que el vendible (INV-001, sin `ventaSinStock` y con rastreo): advertencia `CAR-004` con lo disponible; **no** es error.
- Cupón que dejó de aplicar: no descuenta, advertencia `CUP-003` con el motivo; sigue asociado.
- Carrito vacío: todos los montos en `0.00` (no llames a la calculadora con cero líneas).

### 4. Endpoints (públicos; tienda por subdominio no operativa → 404 `TIE-404`)
| Ruta | Request | Notas |
|---|---|---|
| `POST /vitrina/{sub}/carrito` | — | crea uno nuevo (201); `@LimitarPeticiones(porMinuto = 30)` |
| `GET /vitrina/{sub}/carrito` | encabezado token | |
| `POST /vitrina/{sub}/carrito/items` | `variante_id`, `cantidad` (1–99) | suma |
| `PUT /vitrina/{sub}/carrito/items/{varianteId}` | `cantidad` (0–99) | fija; 0 quita |
| `DELETE /vitrina/{sub}/carrito/items/{varianteId}` | — | |
| `PUT /vitrina/{sub}/carrito/cupon` | `codigo` | CUP-005: reemplaza; si no aplica → 422 `CUP-003` con el motivo y no se asocia |
| `DELETE /vitrina/{sub}/carrito/cupon` | — | |
| `POST /vitrina/{sub}/carrito/vincular` | encabezado token + **sesión** | D-019: sin carrito activo del usuario en esa tienda → el del token pasa a ser suyo. Con uno → fusiona en el del usuario (suma con tope 99; líneas que excedan 50 se descartan con advertencia `CAR-003`), conserva el cupón del usuario o, si no tiene, el del invitado, y marca el del invitado `CONVERTIDO`. Responde el carrito resultante con **su** token. Carrera con `UxCarritoActivoUsuario` → reintenta como fusión |

## Criterios de aceptación (con pruebas)
- [ ] Crear, agregar 2 variantes, cambiar cantidad, quitar con 0: totales correctos (precios incluidos/no incluidos según la tienda).
- [ ] Cambiar el precio de la variante (jdbc o panel) → el carrito muestra el precio nuevo.
- [ ] Despublicar el producto → la línea queda con `CAR-006` y fuera del subtotal.
- [ ] Pedir 5 con vendible 3 → 200 con advertencia `CAR-004`.
- [ ] Cupón 10 % → descuento; cupón vencido → 422 `CUP-003`; cupón que deja de aplicar tras quitar líneas (mínimo de compra) → advertencia.
- [ ] Variante de otra tienda → 422 `CAR-002`; 51 líneas → 422; cantidad 100 → 422.
- [ ] Token de otra tienda → 404 `CAR-404`; tienda desactivada → 404 `TIE-404`.
- [ ] Vincular sin carrito previo y con carrito previo (fusión con suma, tope 99, invitado `CONVERTIDO`); vincular sin sesión → 401.
- [ ] Carrito `CONVERTIDO` (jdbc) → 409 `CAR-008`.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
