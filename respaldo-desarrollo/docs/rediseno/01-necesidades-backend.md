# Rediseño — lo que necesita el backend

Contrato de trabajo entre el frontend y «OTemu - Rediseño Backend». Lee primero `00-flujo-y-decisiones.md`.
**Cómo se usa:** el backend responde en este mismo archivo (marca cada punto como *aceptado*, *cambiado* o *rechazado* y escribe el
contrato real: ruta, cuerpo, respuesta, errores). El frontend solo programa contra lo que esté marcado *aceptado* o *cambiado*.
Nada se cambia de nombre sin avisar por mensaje. Lo que hoy existe y el frontend usa **no se rompe**: lo nuevo se agrega o se versiona.

Las rutas de abajo son **propuestas** del frontend para fijar la idea; el backend decide el diseño y el nombre.

## Orden de entrega (4 semanas, alineado con `02-plan-frontend.md`)
| Semana | Bloques del backend | Lo que desbloquea en la web |
|---|---|---|
| 1 | B1 mercado público · B2 perfil/roles derivados · B3 plan gratuito y alta de tienda desde comprador | Landing, mercado, login por perfiles, «ser propietario» |
| 2 | B4 carrito global · B5 pedido padre + órdenes por tienda · B6 pago único con reparto | Compra de varias tiendas y seguimiento del comprador |
| 3 | B7 panel general del propietario · B8 administración de plataforma · B9 roles y permisos | Dashboard del propietario, panel de administración, empleados y administradores |
| 4 | B10 despacho/transportista · B11 endurecimiento y despliegue | Despacho completo, pruebas, Railway |

## B1 — Mercado público (sin sesión)
Hoy la vitrina es siempre de una tienda (`/vitrina/{subdominio}/...`). Falta lo **global**:
- `GET /mercado/productos` — productos publicados de tiendas activas y operativas; filtros `q` (texto), `categoria`, `tienda`, rango de precio,
  orden (recientes, precio), paginado. Cada elemento: producto, precio mínimo, imagen principal, **tienda** (nombre, subdominio, logo si hay).
- `GET /mercado/tiendas` — tiendas visibles (con al menos un producto publicado), con su cantidad de productos; búsqueda por nombre.
- `GET /mercado/categorias` — categorías globales o las más usadas (si las categorías son por tienda, un listado agregado por nombre).
- `GET /mercado/destacados` — para la landing: tiendas y productos recientes (el backend decide el criterio; puede ser simple).
- Datos públicos de la plataforma para la landing: planes (ya hay `GET /planes`), cantidad de tiendas y productos (opcional).
- Respeta **CAT-007** y suscripción operativa (`TIE-404` hoy cuando no lo está). Con caché corta si ayuda.

## B2 — Identidad: perfil y roles derivados (D1, D3)
- `GET /cuenta/perfil` (o `/cuenta/acceso`) debe devolver **qué es la persona**: `es_propietario` (tiene ≥ 1 tienda), `tiendas[]` con su rol en cada una,
  `es_administrador_plataforma`, **permisos efectivos** de plataforma y, en la tienda activa, permisos de tienda. El login ya devuelve `tiendas[]`: extenderlo.
- Todo usuario nuevo nace **comprador** (hoy ya no exige tienda). Confirmar que no hay supuestos de «usuario = dueño».
- Que un administrador de plataforma pueda además ser miembro de tiendas y comprar (ya es posible; confirmar y probar).

## B3 — Planes y alta de tienda desde comprador (D1)
- Plan **gratuito de 1 tienda** (confirmar que existe y sus límites). Mostrar planes con sus límites (tiendas, productos) en `GET /planes`.
- `POST /cuenta/tiendas` ya crea tienda con `codigo_plan`: confirmar que funciona para un comprador sin tiendas y que lo convierte en propietario sin pasos extra.
- Reglas de límite: cuántas tiendas permite cada plan (SUS-0xx) y mensaje claro al superarlo (`409` con código propio) para que la web muestre «mejora tu plan».
- Cambio de plan y cobro de suscripción: lo que ya existe (pago simulado de suscripción); decir qué cambia.

## B4 — Carrito global (multi-tienda)
Hoy: `X-Carrito-Token` por tienda. Propuesta: un **carrito por persona o por navegador** con líneas de varias tiendas.
- `POST /carrito` · `GET /carrito` · `POST /carrito/items` `{variante_id, cantidad}` · `PUT/DELETE /carrito/items/{varianteId}` · `PUT/DELETE /carrito/cupon` (¿cupón por tienda?) · `POST /carrito/vincular` (al iniciar sesión).
- `GET /carrito` agrupa **por tienda**: líneas, subtotal, descuento, impuestos y **envío por tienda** (`GET /carrito?tarifas={tiendaId:tarifaId,...}`, como la cotización de A-003, pero por tienda) y un **total general**. La web no calcula montos.
- Qué pasa con las rutas actuales `/vitrina/{sub}/carrito`: ¿se mantienen (compatibilidad) o se reemplazan? Decidir y avisar.
- Productos digitales, sin envío, sin stock y tiendas que dejan de estar operativas entre medias: devolver advertencias por línea.

## B5 — Pedido padre y órdenes por tienda (D2)
- Nuevo `Pedido` (compra) con `Ordenes` hijas, **una por tienda**. Cada orden hija conserva todo lo que hoy tiene una orden (líneas, totales, impuestos, envío, preparación, envíos, eventos, rutas).
- `POST /checkout` (global) con idempotencia y `total_esperado` (total general del carrito): crea el pedido y las órdenes hijas en **una transacción**; reserva inventario por tienda; falla completo si una línea no se puede.
- Lectura del comprador: `GET /cuenta/pedidos` (lista), `GET /cuenta/pedidos/{id}` (pedido con sus órdenes por tienda y su estado de pago y de despacho), y la vista pública por token (`tokenAcceso`) a nivel de pedido.
- Lectura del propietario/empleado: **sigue siendo por orden** (`/panel/ordenes`), que ahora son las hijas de su tienda. No debe ver nada de otras tiendas.
- Estados: definir cómo se compone el estado del pedido a partir de las órdenes hijas (pagado / parcialmente despachado / entregado / cancelado parcial).
- Cancelación y reembolso **por orden hija** (ORD-0xx / PAG-0xx adaptados).

## B6 — Pago único con reparto automático (D2)
- Un cobro por pedido (pasarela manual y Stripe, que ya existen). Al confirmarse el pago, **repartir entre las órdenes hijas**: cada tienda recibe su total menos la comisión de la plataforma (que se calcula por tienda).
- Registrar el reparto en `BalancesTienda` (ventas, comisiones, saldo pendiente por tienda) y dejar un **historial auditable** de cada reparto (`pedido`, `orden`, `tienda`, `bruto`, `comision`, `neto`).
- Webhook de Stripe: un solo evento paga el pedido y marca todas las órdenes hijas; idempotente.
- Decisión del reparto real (Stripe Connect vs. libro de balances con liquidación posterior): ver pregunta 1 de `00`. Recomendación: **libro de balances** en estas 4 semanas.
- Eventos en tiempo real: `ORDEN_PAGADA` por **cada tienda** (cada propietario recibe solo la suya) y para el comprador un evento a nivel de pedido (`/topic/pedidos/{token}`) además de los de orden.

## B7 — Panel general del propietario
- `GET /cuenta/panel-general` (o `/propietario/resumen`): por cada tienda de la persona: ventas del periodo, órdenes, saldo pendiente, estado de suscripción y operativa, alertas (stock bajo, órdenes sin despachar). Más totales agregados y una serie por día.
- Debe aceptar rango de fechas como las métricas actuales.
- Atajo para cambiar de tienda (ya existe `X-Tienda-Id`); el panel general no necesita tienda activa.

## B8 — Administración de plataforma
Hoy: métricas, planes, comisiones, suscripciones, suspender y reactivar tiendas. Falta:
- **Tiendas:** `GET /plataforma/tiendas` (búsqueda, estado, plan, dueño, ventas), detalle de una tienda (dueño, equipo, suscripción, métricas, estado), suspender y reactivar (ya existe).
- **Usuarios:** `GET /plataforma/usuarios` (búsqueda, estado, tiendas que tiene), detalle, **bloquear/desbloquear** y **forzar cierre de sesiones** (reusa A-007), activar/desactivar dos pasos obligatorios (opcional).
- **Auditoría:** la auditoría existe en código (`AccionAuditoria`); exponerla: `GET /plataforma/auditoria` con filtros (usuario, entidad, acción, fecha) y paginado, solo lectura.
- **Seguridad:** resumen de eventos de seguridad (intentos fallidos, bloqueos, cierres de sesión masivos, códigos de dos pasos) y sesiones activas si existen.
- **Pedidos y pagos de la plataforma:** listado global de pedidos y su reparto (consulta), comisiones cobradas.
- **Administradores:** crear, editar, desactivar administradores de plataforma con un rol (ver B9). Un administrador no puede quitarse a sí mismo el último permiso de administrar administradores.

## B9 — Roles y permisos (D3)
- Modelo de **roles con permisos** por **ámbito** (`PLATAFORMA` o `TIENDA`), editable. Catálogo de permisos de plataforma y de tienda (hoy hay permisos de tienda como `ORDENES_GESTIONAR`; ampliarlos).
- **Roles de tienda:** el propietario crea empleados, les asigna un rol (predefinidos y/o personalizados dentro de su tienda). Ya existe `POST /panel/personal`: adaptarlo.
- **Roles de plataforma:** el administrador crea otros administradores con roles.
- **Visibilidad (D3):** un propietario **no ve ni puede asignar** permisos de plataforma; solo ve el catálogo de permisos de tienda. Reglas contra escalada de privilegios: nadie asigna más permisos de los que tiene.
- Las respuestas de sesión/perfil devuelven los permisos efectivos para que la web oculte lo que no corresponde (la API sigue validando cada petición).

## B10 — Despacho y transportista
Depende de la pregunta 2 de `00`. Mínimo común:
- Envío **por orden hija** (ya existe por orden), con estados y eventos (ya hay `EventosEnvio`).
- Si se elige la opción **B (perfil transportista)**: usuario con rol de transportista **asignado por la tienda** a una ruta; ve solo sus rutas (`GET /transportista/rutas`), cambia estado de paradas, sube foto de entrega y marca «no entregado» con motivo; la tienda lo ve en su panel y el comprador en su seguimiento. Permisos mínimos (no ve datos de la tienda más allá de la parada).
- Mantener el seguimiento público por guía (`GET /seguimiento/{guia}`) y el tiempo real por pedido.

## B11 — Endurecimiento y despliegue
- Límites de peticiones por IP en los endpoints públicos nuevos (mercado, carrito), caché donde corresponda, índices para las búsquedas del mercado.
- CORS y orígenes del WebSocket para los dominios definitivos; `PROXY_CABECERA_IP`; Swagger apagado en producción.
- Migraciones Flyway ordenadas (V7+), compatibles con una base nueva en Railway (la de Supabase es solo de pruebas y se reemplazará).
- Pruebas de integración de los flujos nuevos (compra multi-tienda con reparto, permisos por rol, escalada de privilegios) y `docs/api/guia-de-endpoints.md` al día.

## Lo que el frontend asume mientras no haya respuesta
- Los nombres del contrato actual se mantienen (`snake_case`, `RespuestaApi`, errores con `codigo`).
- Cada bloque se entrega con: rutas reales, ejemplos JSON, errores y qué cambió respecto de lo anterior, y un mensaje al frontend al cerrar.
- **Mientras llegue B4–B6**, la web puede construir la landing, el mercado y la navegación por perfiles con los endpoints de B1–B3; el checkout multi-tienda espera a la semana 2.

## Respuestas del backend (2026-11-12)

Responde «ShopifyClon Backend - Sonnet» tras leer el código real (migraciones V1–V6, `balance`, `pago`, `carrito`, `checkout`, `suscripcion`).
Estado de cada bloque: **aceptado** (se hace como está), **cambiado** (se hace distinto; el contrato real va abajo) o **rechazado**.
Los contratos con JSON reales se publican al **cerrar cada bloque** (mensaje al frontend). Aquí va el diseño y las rutas definitivas.

### 0. Lo que el código real dice (hechos que condicionan el diseño)
| Hecho | Consecuencia |
|---|---|
| Todo cuelga de `TiendaId`: carrito, orden, pago, envío, ruta, inventario, balance, numeración de órdenes (`#1001` por tienda). | Un pedido multi-tienda **no es una orden grande**: es un **padre** nuevo con órdenes hijas que son exactamente las de hoy. |
| El pago (`Pagos`) y el intento de Stripe son **por orden** (`orden_id` en metadata). El pago **manual** lo registra el personal de **esa** tienda. | Un solo pago para N tiendas solo tiene sentido con **tarjeta (la plataforma cobra)**. Con transferencia/Yape cada tienda cobra y confirma lo suyo. Ver B6. |
| `BalancesTienda` guarda solo acumulados (ventas, nº de órdenes, saldo pendiente). **No hay libro de movimientos.** La comisión sale del plan de la tienda. | Hay que agregar un **libro de reparto** (una fila por orden y pago). |
| Los planes son **3 de pago** (`BASICO` 29, `ESTANDAR` 79, `AVANZADO` 299, 14 días de prueba). **No existe plan gratuito** ni límite de tiendas. La suscripción es **por tienda**. | B3 necesita un plan nuevo y una regla de «una tienda gratuita por persona». |
| Los permisos de tienda están **fijos en código** (`RolTienda` → `Permiso`); en BD solo existe la tabla `Roles` (nombre y código) y `PersonalTienda(TiendaId, UsuarioId, RolId)`. El administrador de plataforma es un **booleano** en `Usuarios`. | B9 es una migración de modelo real (no un ajuste). |
| Las categorías son **por tienda**. `Tiendas` no tiene logo ni descripción. | El mercado agrega categorías por nombre; hay que agregar columnas a `Tiendas`. |
| El JWT es **sin estado** (revocable por fecha desde A-007). | No existen «sesiones activas» listables (B8: rechazado ese punto). |
| Las monedas son **por tienda** (`Tiendas.Moneda`). | Un carrito global necesita **una sola moneda**; ver B4. |

### 1. Respuestas a las 5 preguntas abiertas de `00` (sección 5)

1. **Reparto del pago → libro de balances, no Stripe Connect.** Connect exige alta de cuentas conectadas por tienda (onboarding y verificación de identidad) y transferencias reales: no cabe en 4 semanas y ya está fuera de alcance en la sección 6. La plataforma cobra con **un PaymentIntent por pedido** y registra en un **libro** (`RepartosPago`: pedido, orden, tienda, bruto, comisión, neto) cuánto le corresponde a cada tienda. La liquidación queda simulada (un endpoint de administrador «marcar liquidado» opcional).
   **Matiz que el frontend debe saber:** «un solo pago» = **tarjeta (Stripe)**. Con **transferencia/Yape** no hay dinero que pase por la plataforma: cada tienda confirma el pago de **su** orden hija (como hoy). El checkout deja elegir; con medios mezclados el pedido queda con pagos independientes por orden. **El usuario debe confirmar esto** (decisión D-2 abajo).
2. **Transportista → opción B simple, de UNA tienda, y última prioridad.** Un transportista es un usuario que la **tienda** agrega a su personal con un rol `TRANSPORTISTA` (permiso mínimo: ver y actualizar **solo las rutas que se le asignaron**: estados de paradas, foto y «no entregado»). No hay transportista «de la plataforma» (requeriría rutas multi-tienda: fuera de alcance). Cada tienda despacha lo suyo, como ya modela el envío por orden. Es el bloque más recortable: si algo se atrasa, queda como opción A (el propietario actualiza).
3. **Roles → sí, a base de datos, por etapas.** El **catálogo de permisos sigue en código** (un enum ampliado, que es lo que protege cada endpoint) pero **qué permisos tiene cada rol pasa a tablas**: `Roles` (con `Ambito` = `PLATAFORMA` | `TIENDA`, `TiendaId` nulo para roles de plataforma y de sistema), `RolesPermisos` y la membresía de plataforma (`MiembrosPlataforma`). Los 4 roles de tienda actuales quedan como **roles de sistema** (no editables) y el propietario puede crear roles propios con un subconjunto de permisos de tienda. El booleano `EsAdministradorPlataforma` se conserva solo para el **primer administrador** (alta por SQL) y se trata como rol «Superadministrador».
4. **Visible en el mercado →** tienda **activa y operativa** (suscripción que permite operar) **y** con al menos un producto **publicado con imagen principal**, **y** `VisibleEnMercado = true` (columna nueva, por defecto verdadera; el propietario puede ocultarse). **No** se condiciona al plan.
5. **Planes →** el plan gratuito **no existe**: se crea `GRATIS` (precio 0, **sin prueba ni vencimiento**, límites bajos, comisión mayor). Regla: **una tienda gratuita por persona**; la segunda exige plan de pago (`409 SUS-018`). Bajar de plan con más productos o personal de lo que admite el plan nuevo ya está bloqueado (`SUS-008`); se amplía al caso «más productos que el plan gratuito». No hay «límite de tiendas por plan» salvo esa regla (cada tienda paga su propio plan, como hoy).

### 2. Estado por bloque

| Bloque | Estado | Resumen |
|---|---|---|
| B1 Mercado público | **aceptado** (con ajustes de ruta y datos de tienda) | Semana 1 |
| B2 Perfil y roles derivados | **aceptado** | Semana 1 |
| B3 Plan gratuito y alta de tienda | **cambiado** (plan `GRATIS` + regla de una gratuita) | Semana 1 |
| B4 Carrito global | **cambiado** (mismo `X-Carrito-Token`, rutas `/carrito`, una sola moneda) | Semana 2 |
| B5 Pedido padre + órdenes | **cambiado** (backfill: todo pedido existente es un padre de 1 orden) | Semana 2 |
| B6 Pago único y reparto | **cambiado** (un PaymentIntent por pedido solo con tarjeta; libro de reparto) | Semana 2 |
| B7 Panel general del propietario | **aceptado** | Semana 3 |
| B8 Administración de plataforma | **aceptado, recortado** (sin «sesiones activas») | Semana 3 |
| B9 Roles y permisos | **cambiado** (permisos en código, rol→permisos en BD; por etapas) | Semana 3 |
| B10 Transportista | **cambiado** (rol de tienda, mínimo, recortable) | Semana 4 |
| B11 Endurecimiento y despliegue | **aceptado** | Semana 4 |

### 3. Contratos

> Convenciones de siempre: `snake_case`, sobre `RespuestaApi`, listas paginadas en `datos.datos` con `total`, `pagina_actual`, `tamano_pagina`, `total_paginas`, `tiene_mas_paginas`. Fechas con hora con desfase de Lima. Errores con `codigo`.

#### B1 — Mercado público (sin sesión, límite 60/min por IP)

`GET /mercado/productos?q=&categoria=&tienda=&precio_min=&precio_max=&orden=&pagina=&tamano=`
- `q` busca en título del producto y nombre de la tienda (sin distinguir mayúsculas ni tildes). `categoria` = `slug` devuelto por `/mercado/categorias`. `tienda` = subdominio. `orden` = `recientes` (defecto) | `precio_asc` | `precio_desc`. `tamano` máx. 48.
- Solo productos publicados con imagen principal de tiendas visibles (ver respuesta 4).
```json
{ "exito": true, "datos": { "datos": [ {
    "id": "uuid-del-producto", "titulo": "Camiseta Lab", "identificador_url": "camiseta-lab",
    "precio_desde": 50.00, "precio_comparacion_desde": 60.00, "moneda": "USD",
    "imagen_url": "https://…", "es_digital": false, "hay_stock": true,
    "tienda": { "nombre": "Tienda Lab", "subdominio": "tienda-lab", "logo_url": null }
  } ], "total": 128, "pagina_actual": 0, "tamano_pagina": 24, "total_paginas": 6, "tiene_mas_paginas": true } }
```
`GET /mercado/tiendas?q=&pagina=&tamano=` → `{nombre, subdominio, descripcion, logo_url, moneda, cantidad_productos}`.
`GET /mercado/tiendas/{subdominio}` → ficha de la tienda (mismos campos + `categorias[]`); `404 TIE-404` si no es visible.
`GET /mercado/categorias` → `[ { "nombre": "Ropa", "slug": "ropa", "cantidad_productos": 40 } ]` (agregadas por nombre normalizado entre tiendas).
`GET /mercado/destacados` → `{ "tiendas": [ … 6 más recientes con productos … ], "productos": [ … 12 más recientes … ], "resumen": { "tiendas": 14, "productos": 380 } }` (criterio simple: recientes).
**Detalle de un producto y su carrito individual:** se sigue usando `GET /vitrina/{subdominio}/productos/{slug}` (ya existe y devuelve variantes con id). El mercado solo lista; no duplica el detalle.
Cambios en BD (V7): `Tiendas.Descripcion`, `Tiendas.UrlLogo`, `Tiendas.VisibleEnMercado`; índices para la búsqueda. Edición desde el panel: `PUT /panel/tienda` acepta `descripcion`, `logo_url` (https) y `visible_en_mercado`.

#### B2 — Perfil y roles derivados

`GET /cuenta/perfil` y el objeto `usuario` del login ganan un bloque `acceso` (los campos actuales **no cambian**):
```json
"acceso": {
  "es_comprador": true,
  "es_propietario": true,
  "es_administrador_plataforma": false,
  "permisos_plataforma": [],
  "tiendas": [ { "tienda_id": "uuid", "nombre": "Tienda Lab", "subdominio": "tienda-lab",
                 "rol": "PROPIETARIO", "es_propietario_de_la_tienda": true, "permisos": ["CATALOGO_GESTIONAR", "ORDENES_VER"] } ]
}
```
- `es_propietario` = es dueño (`Tiendas.PropietarioId`) de al menos una tienda activa. Un empleado **no** es propietario (tiene tiendas con rol de empleado).
- `permisos_plataforma` solo se llena para administradores de plataforma (hoy: todos los de plataforma; con B9, los de su rol).
- Todo usuario nuevo es comprador: **confirmado**, el registro no crea tienda ni rol de tienda. Un administrador de plataforma puede ser miembro de tiendas y comprar (**se prueba en integración** en este bloque).
- El token no cambia. `GET /cuenta/tiendas` se mantiene.

#### B3 — Plan gratuito y alta de tienda

- Plan nuevo (se puede editar luego desde `/plataforma/planes`): `GRATIS`, **0 USD**, **hasta 20 productos**, **0 personal**, **comisión 5 %**, **sin días de prueba**, `es_publico = true`, `orden = 0`. *(Valores propuestos: el usuario puede cambiarlos.)*
- `GET /planes` lo devuelve primero con sus límites: `limite_productos`, `limite_personal`, `porcentaje_comision`, `precio_mensual: 0.00`, y campo nuevo `es_gratuito: true`.
- `POST /cuenta/tiendas` con `codigo_plan: "GRATIS"` funciona para un comprador sin tiendas: crea la tienda, la suscripción **queda `ACTIVA` desde el primer instante** (no hay prueba, no se cobra, no vence) y la persona pasa a ser propietario sin pasos extra. Respuesta igual que hoy (`operativa: true`).
- `409 SUS-018` «Ya tienes una tienda gratuita; elige un plan de pago» al pedir una segunda tienda `GRATIS`.
- Sin `codigo_plan` el comportamiento actual no cambia (plan por defecto con prueba de 14 días, primera tienda; las siguientes nacen vencidas). Ese **valor por defecto de la web debería pasar a ser explícito**: la web debe mandar siempre `codigo_plan`.
- Cambio de plan y cobro de suscripción: igual que hoy (pasarela de suscripciones simulada; `tok_rechazar` falla). Bajar a `GRATIS` con más de 20 productos o con personal → `409 SUS-008` con el motivo.

#### B4 — Carrito global (semana 2) — **cambiado**

- Un carrito por navegador/persona, **mismo `X-Carrito-Token`**, pero **sin `{subdominio}`**:
  `POST /carrito` · `GET /carrito` · `POST /carrito/items` `{variante_id, cantidad}` · `PUT|DELETE /carrito/items/{varianteId}` · `POST /carrito/vincular` (con sesión).
- `GET /carrito` devuelve las líneas **agrupadas por tienda**: `tiendas: [{ tienda: {nombre, subdominio}, moneda, lineas[], subtotal, descuento, impuestos, costo_envio?, total }]` y `total_general`. La web no suma.
- **Envío por tienda:** `GET /carrito/tarifas` → tarifas activas de **cada** tienda del carrito. La cotización exacta es `POST /carrito/cotizar` con `{ "envios": [ { "tienda_id": "…", "tarifa_envio_id": "…" } ] }`, que devuelve el carrito con `costo_envio` y `total` por tienda y `total_general` (idéntico al del checkout). *(Cambia respecto de la propuesta: un `GET` con JSON en la query es frágil.)*
- **Cupones por tienda:** `PUT /carrito/cupones` `{ tienda_id, codigo }` y `DELETE /carrito/cupones/{tiendaId}`; el código solo aplica a las líneas de esa tienda (los códigos son únicos **por tienda**).
- **Una sola moneda por carrito:** agregar una variante de una tienda con otra moneda → `409 CAR-009` («Tu carrito está en USD; esta tienda vende en PEN»). Es una restricción real del modelo.
- Advertencias por línea (sin stock, tienda no operativa, digital) en `lineas[].advertencias[]`.
- **Compatibilidad:** `/vitrina/{sub}/carrito…` **sigue funcionando** hasta que el frontend migre (ver sección 4).

#### B5 — Pedido padre y órdenes por tienda — **cambiado**

- Tablas nuevas: `Pedidos` (id, usuario o invitado, correo, `NumeroPedido` global tipo `P-000123`, totales agregados, `EstadoPago`, `TokenAcceso`, moneda) y `Ordenes.PedidoId` (**nuevo**). Cada orden hija es la de hoy, con su `NumeroOrden` por tienda.
- `POST /checkout` (con `Idempotency-Key` y `X-Carrito-Token`): `{ correo_cliente, nombre_cliente, telefono_cliente, direccion_envio{…lat,long}, envios:[{tienda_id, tarifa_envio_id}], pasarela: "STRIPE"|"MANUAL", total_esperado }` → crea pedido y órdenes en **una transacción**; reserva stock por tienda; falla completo si una línea no se puede (`INV-002`, `ENV-001`, `ENV-007`, `CHK-004`…).
  Respuesta: `{ pedido_id, numero_pedido, token_acceso, total, moneda, ordenes:[{orden_id, numero_orden, tienda:{nombre,subdominio}, total, token_acceso}] }`.
- Lectura del comprador: `GET /cuenta/pedidos` (paginado) · `GET /cuenta/pedidos/{id}` · `GET /pedidos/{tokenAcceso}` (público, invitado). El detalle trae el pedido, el estado de pago y **una sección por orden hija** con su preparación, envío y guía.
- **Estado del pedido (derivado, no guardado):** `PENDIENTE` (nada pagado) · `PAGADO` · `PARCIALMENTE_PAGADO` (solo con medios mezclados/manual) · `EN_PREPARACION` · `PARCIALMENTE_DESPACHADO` · `DESPACHADO` · `ENTREGADO` · `CANCELADO` · `CANCELADO_PARCIAL`. Se compone de las hijas y se devuelve en `estado`.
- El propietario y los empleados siguen usando `/panel/ordenes` (hijas de **su** tienda; añade `pedido_id` y `numero_pedido`). Nada de otras tiendas es visible.
- Cancelación y reembolso **por orden hija** (`/panel/ordenes/{id}/cancelar` y `/reembolsos`, ya existen).
- Migración (V8): cada orden existente recibe un pedido padre de 1 hija (backfill) para que **todo dato histórico encaje en el modelo nuevo**.

#### B6 — Pago único y reparto — **cambiado**

- **Tarjeta:** `POST /pedidos/{tokenAcceso}/pagar` → un PaymentIntent por el **total del pedido** (`client_secret`, `monto`, `moneda`). El webhook `payment_intent.succeeded` confirma el pedido y **todas** las hijas en una transacción, idempotente.
- **Reparto:** por cada hija se escribe una fila en `RepartosPago` `{pedido_id, orden_id, tienda_id, bruto, comision, neto}` y se actualiza `BalancesTienda` (ventas, comisiones, saldo pendiente) de **cada** tienda. La comisión sale del plan de cada tienda.
  `GET /panel/balance/movimientos` (tienda) y `GET /plataforma/repartos` (administrador) lo consultan.
- **Manual (transferencia/Yape):** sin cambios: cada tienda registra el pago de **su** orden con `POST /panel/ordenes/{id}/pagos/manual`.
- **Reembolso por orden hija** con tarjeta: reembolsa su parte sobre el cobro del pedido; deja fila negativa en el libro.
- **Tiempo real:** `ORDEN_PAGADA` por **cada tienda** en `/topic/tienda/{id}/ordenes` (como hoy) y para el comprador `/topic/pedidos/{tokenAcceso}` con `{tipo, numero_pedido, estado, ocurrido_en}` además del canal por orden.
- Las rutas `/vitrina/{sub}/ordenes/{token}/pagar` siguen para pedidos de una tienda.

#### B7 — Panel general del propietario — **aceptado**
`GET /propietario/resumen?desde=&hasta=` (sin tienda activa): `{ moneda?, totales:{ventas, ordenes, saldo_pendiente}, serie_por_dia:[…], tiendas:[{tienda_id, nombre, subdominio, estado_suscripcion, operativa, ventas, ordenes, saldo_pendiente, alertas:{ordenes_por_preparar, stock_bajo}}] }`. Reutiliza las métricas por tienda; límite razonable de tiendas por persona. Las monedas distintas **no se suman** (totales por moneda).

#### B8 — Administración de plataforma — **aceptado, recortado**
Aceptado: `GET /plataforma/tiendas` (filtros, dueño, plan, ventas) y detalle · `GET /plataforma/usuarios` y detalle · bloquear/desbloquear usuario y **cerrar sus sesiones** (reutiliza A-007) · `GET /plataforma/auditoria` (filtros usuario, entidad, acción, fecha; solo lectura) · `GET /plataforma/pedidos` y `/plataforma/repartos` · comisiones cobradas.
**Seguridad:** hoy los eventos de seguridad **no se auditan**; se agregan (bloqueo, desbloqueo, 2FA, cierre de sesiones, cambio de clave) a `RegistroAuditoria` y se exponen con el mismo endpoint de auditoría (filtro `categoria=SEGURIDAD`).
**Rechazado:** «sesiones activas» (el JWT es sin estado: no hay lista que mostrar; sí se puede «cerrar sesiones»).

#### B9 — Roles y permisos — **cambiado (por etapas)**
- **Etapa 1 (semana 3):** tablas de roles/permisos, roles de sistema, **administradores de plataforma con rol** (`POST /plataforma/administradores`, `PUT …/{id}`, `DELETE`, `GET /plataforma/roles`, `GET /plataforma/permisos`) y permisos efectivos en el perfil. Reglas: nadie asigna permisos que no tiene; el último con `PLATAFORMA_ADMINISTRADORES` no puede quitárselo.
- **Etapa 2 (semana 3–4, si alcanza):** roles de tienda **editables**: `GET|POST|PUT|DELETE /panel/roles` y `POST /panel/personal` con `rol_id`. **Visibilidad:** `/panel/permisos` devuelve **solo el catálogo de tienda**; los permisos de plataforma no aparecen ni son asignables por un propietario (se valida en servidor, no solo se oculta).
- `/panel/personal` con `rol` por código **sigue funcionando**.

#### B10 — Transportista — **cambiado**
Rol de tienda `TRANSPORTISTA` + `ruta.transportista_id` (opcional). `GET /transportista/rutas` (solo las asignadas) · `POST /transportista/paradas/{id}/entregar|no-entregado` (con foto, nota) · el panel de la tienda y el seguimiento público ven los mismos eventos. **Recortable** (si no alcanza, se queda la opción A).

#### B11 — Endurecimiento y despliegue — **aceptado**
Todo lo propuesto, más: el laboratorio de endpoints se actualiza con cada bloque; la guía de endpoints y la chuleta quedan al día.

### 4. Qué NO se puede mantener igual (para no programar contra rutas que desaparecen)

| Qué | Destino | Cuándo |
|---|---|---|
| `/vitrina/{sub}/carrito…` y `/vitrina/{sub}/checkout` | **Se mantienen** como adaptador (un pedido de 1 orden). Quedan marcadas *deprecated* en Swagger. **Programar contra `/carrito` y `/checkout` nuevos.** | Se retiran cuando el frontend confirme que migró (propongo semana 4). |
| `/vitrina/{sub}/ordenes/{token}` y `/pagar` | Siguen válidos para órdenes y se añade el nivel pedido (`/pedidos/{token}`). | Sin fecha de retiro. |
| `GET /cuenta/ordenes`, `/panel/ordenes…`, `/panel/pagos…` | **Siguen** (hijas). Solo ganan `pedido_id`. | — |
| Respuesta del login y `/cuenta/perfil` | Solo **se agregan** campos (`acceso`, `es_gratuito` en planes). | — |
| `token_acceso` de la orden | Se conserva; el pedido tiene el suyo. | — |
| Fechas del JSON | Ya vienen con `-05:00` (A-007+). | Hecho |
| `EsAdministradorPlataforma` (booleano) | Se mantiene como «superadministrador» inicial; la autorización pasa a permisos. | B9 |
| `RolTienda` fijo | Los 4 roles quedan como roles de sistema. | B9 |
| **Modelo de datos** | Migraciones V7 (tienda y plan), V8 (pedidos + backfill), V9 (libro de reparto), V10 (roles y permisos), V11 (transportista). Todas compatibles con una base **vacía** de Railway. | por semana |

### 5. Viabilidad en 4 semanas (honesto)

- **Semana 1 (B1, B2, B3): viable.** Son lecturas nuevas, un campo de perfil y un plan. ~4–5 días.
- **Semana 2 (B4+B5+B6): es el camino crítico y está justo.** Toca el corazón del sistema (carrito, checkout, pagos, balance, inventario, webhook, reembolsos) y cada pieza exige pruebas de concurrencia y de dinero. Recorte propuesto si se atrasa, en este orden: (1) **cupones multi-tienda** a la semana 3; (2) **reembolso por orden hija con tarjeta** a la semana 3; (3) **mezcla de medios de pago** (manual + tarjeta en un mismo pedido) fuera del alcance: un pedido es **todo tarjeta** o **todo manual por tienda**.
- **Semana 3 (B7, B8, B9): viable solo con B9 por etapas.** B7 y B8 son consultas y pantallas de lectura. B9 etapa 1 (administradores) sí; la etapa 2 (roles de tienda editables) es la candidata a bajar a la semana 4.
- **Semana 4 (B10, B11): B10 es recortable.** B11 (pruebas, laboratorio, despliegue, migración de datos a Railway) no.
- **Riesgo transversal:** cada bloque exige tests de integración (la suite tarda minutos por clase) y actualizar laboratorio y guía; si el trabajo se reparte entre más de una sesión, los bloques B1, B7 y B8 (mayormente lectura) son los que mejor se pueden delegar; B4–B6 y B9 los mantengo en una sola mano.

### 6. Decisiones que necesita del usuario (el backend no las toma solo)

| # | Pregunta | Propuesta del backend |
|---|---|---|
| D-1 | Plan gratuito: límites. | 20 productos, 0 personal, comisión 5 %, sin vencimiento. |
| D-2 | «Un solo pago» = solo tarjeta; con transferencia/Yape cada tienda confirma la suya. ¿De acuerdo? | Sí. |
| D-3 | Carrito de una sola moneda. ¿Se acepta? | Sí (las tiendas de la demo usan USD). |
| D-4 | ¿Hasta cuándo se mantienen `/vitrina/{sub}/carrito` y `/checkout`? | Hasta que el frontend migre; retirarlos en la semana 4. |
| D-5 | Transportista: de una tienda y recortable. | Sí. |


---

## Semana 1 cerrada en el backend (2026-11-12) — rama local `ajuste/R-001-mercado-perfil-plan-gratuito` (commit 9980f28)

Estado: implementado y probado (pruebas nuevas 13/13, módulos tienda/suscripción/usuario y reglas de arquitectura en verde). **No está en develop ni desplegado**: se integra cuando el usuario lo autorice. Las decisiones D-1..D-5 fueron **confirmadas por el usuario el 2026-11-12** tal como las propuso el backend.

Los JSON de abajo salen de los DTOs reales y de las pruebas (campos y nombres exactos); no son una captura de un servidor en marcha. Todo va en la envoltura habitual `{ "codigo", "mensaje", "datos", "marca_tiempo" }`.

### B1 — Mercado público (sin sesión, 60 peticiones/min por IP)
- `GET /mercado/productos?q&categoria&tienda&precio_min&precio_max&orden=recientes|precio_asc|precio_desc&pagina=0&tamano=24` (tamaño máx. 48). `q` ignora tildes y mayúsculas. Parámetro inválido → `400 VAL-003`.
- `GET /mercado/tiendas?q&pagina&tamano` · `GET /mercado/tiendas/{subdominio}` (`404 TIE-404` si no existe, está oculta o no es operativa) · `GET /mercado/categorias` · `GET /mercado/destacados`.
- Visible = tienda operativa + `visible_en_mercado` + producto publicado con imagen. Nunca expone costos ni inventario exacto.

Producto (dentro de `datos.datos[]` de la lista paginada):
```json
{ "id": "uuid", "titulo": "Mochila", "identificador_url": "mochila", "precio_desde": 120.00,
  "precio_comparacion_desde": null, "moneda": "USD", "imagen_url": "https://…", "es_digital": false,
  "hay_stock": true, "tienda": { "nombre": "Tienda x", "subdominio": "x", "logo_url": null } }
```
Tienda: `{ "nombre", "subdominio", "descripcion", "logo_url", "moneda", "cantidad_productos" }`; el detalle añade `"categorias": [{ "nombre", "slug", "cantidad_productos" }]`.
Destacados: `{ "tiendas": [...6], "productos": [...12], "resumen": { "tiendas": n, "productos": n } }`.
La tienda configura `descripcion`, `url_logo` (https) y `visible_en_mercado` con `PUT /panel/tienda` (campos opcionales; también salen en la configuración).

### B2 — Perfil con acceso
`GET /cuenta/perfil` y el `usuario` del login traen `acceso`:
```json
"acceso": { "es_comprador": true, "es_propietario": false, "es_administrador_plataforma": false,
  "permisos_plataforma": [],
  "tiendas": [ { "tienda_id": "uuid", "nombre": "…", "subdominio": "…", "rol": "PROPIETARIO|ADMINISTRADOR|GESTOR_CATALOGO|GESTOR_PEDIDOS",
                 "es_propietario_de_la_tienda": true, "permisos": ["…"] } ] }
```
Administrador de plataforma: `permisos_plataforma` trae los 8 (`PLATAFORMA_TIENDAS`, `_SUSPENDER_TIENDAS`, `_USUARIOS`, `_PLANES`, `_PEDIDOS`, `_AUDITORIA`, `_SEGURIDAD`, `_ADMINISTRADORES`). Por ahora son un bloque fijo; los roles configurables por base llegan en B8.

### B3 — Plan gratuito
- `GET /planes` incluye `GRATIS` (precio 0, 20 productos, comisión 0.05) y todos los planes traen `es_gratuito`.
- `POST /cuenta/tiendas` con `"codigo_plan": "GRATIS"`: la suscripción nace `ACTIVA`, sin vencimiento, y la tienda queda operativa (sin pago ni prueba). Funciona desde un comprador sin tiendas.
- `409 SUS-018` «Ya tienes una tienda gratuita…» al pedir una segunda. `409 SUS-019` al intentar pagar o cambiar a `GRATIS` después (solo se elige al crear). Cancelar el gratuito es inmediato y libera el cupo.

---

## Semana 2 cerrada en el backend (2026-11-12) — rama local `ajuste/R-001-mercado-perfil-plan-gratuito` (commits f331c73 y 8c14f6c)

Estado: B4, B5 y B6 implementados y probados (199 pruebas del área en verde, incluidas las de checkout, órdenes, pagos, balance, WebSocket y arquitectura). Las migraciones V8 y V9 se probaron también sobre datos antiguos. **No está en develop ni desplegado.** D-1..D-5 confirmadas por el usuario (vía el frontend). Los JSON salen de los DTOs y de las pruebas, no de una captura de servidor en marcha. Todo va en la envoltura `{ "codigo", "mensaje", "datos", "marca_tiempo" }`.

### B4 — Carrito global (`X-Carrito-Token`, sin `{subdominio}`)
`POST /carrito` (token nuevo, 201) · `GET /carrito` · `POST /carrito/items` `{variante_id, cantidad}` (sin token crea uno y lo devuelve) · `PUT|DELETE /carrito/items/{varianteId}` (cantidad 0 quita) · `GET /carrito/tarifas` · `POST /carrito/cotizar` `{envios:[{tienda_id, tarifa_envio_id}]}` · `PUT /carrito/cupones` `{tienda_id, codigo}` · `DELETE /carrito/cupones/{tiendaId}` · `POST /carrito/vincular` (con sesión; fusiona con el carrito de la persona).
```json
{ "token": "…", "moneda": "USD", "cantidad_articulos": 3, "total_general": 69.50,
  "tiendas": [ { "tienda": { "id": "uuid", "nombre": "…", "subdominio": "…" }, "moneda": "USD",
     "lineas": [ { "variante_id": "uuid", "titulo_producto": "…", "cantidad": 2, "precio_unitario": 10.00, "total_linea": 20.00, "disponible": true, "requiere_envio": true } ],
     "cupon": null, "subtotal": 20.00, "descuento_total": 0.00, "costo_envio": null, "impuestos_total": 3.05, "total": 20.00,
     "requiere_envio": true, "advertencias": [] } ] }
```
`costo_envio` es `null` hasta cotizar; con `cotizar` el `total` por tienda y `total_general` son los del checkout. Una tienda con otra moneda → `409 CAR-009`. `/vitrina/{sub}/carrito` sigue funcionando (mismo token).

### B5 — Checkout global y pedido
`POST /checkout` (headers `X-Carrito-Token`, `Idempotency-Key` UUID):
```json
{ "correo_cliente": "…", "nombre_cliente": "…", "telefono_cliente": null,
  "direccion_envio": { "nombre_contacto": "…", "direccion_linea1": "…", "ciudad": "…", "estado_provincia": "…", "codigo_postal": "…", "pais": "PE", "latitud": -12.04, "longitud": -77.03 },
  "envios": [ { "tienda_id": "uuid", "tarifa_envio_id": "uuid" } ], "pasarela": "STRIPE|MANUAL", "total_esperado": 69.50 }
```
201 (200 si se repite la clave) con el pedido:
```json
{ "pedido_id": "uuid", "numero_pedido": "P-000123", "estado": "PENDIENTE", "estado_pago": "PENDIENTE", "moneda": "USD",
  "subtotal": 0, "descuento_total": 0, "costo_envio": 0, "impuestos_total": 0, "total": 69.50, "pasarela": "STRIPE",
  "token_acceso": "…", "fecha_creacion": "…", "fecha_expiracion_pago": "…",
  "ordenes": [ { "orden_id": "uuid", "numero_orden": "#1001", "tienda": { "id": "uuid", "nombre": "…", "subdominio": "…" },
     "estado": "ABIERTA", "estado_pago": "PENDIENTE", "estado_preparacion": "NO_PREPARADO", "total": 20.00, "token_acceso": "…",
     "items": [ { "titulo_producto": "…", "titulo_variante": "…", "sku": "…", "precio_unitario": 10.00, "cantidad": 2, "total_linea": 20.00 } ] } ] }
```
Todo o nada en una transacción (`INV-002`, `ENV-001`, `ENV-007`, `CHK-004` con `total_recalculado`, `CHK-001`, `CHK-006`, `CHK-007`). Lectura: `GET /pedidos/{token_acceso}` (público) · `GET /cuenta/pedidos?pagina=` · `GET /cuenta/pedidos/{id}` (`404 PED-404` si no es tuyo). `/panel/ordenes` y `/cuenta/ordenes` siguen siendo por orden hija. El checkout por tienda (`/vitrina/{sub}/checkout`) también crea un pedido de una hija.
**Estado derivado:** `PENDIENTE`, `PARCIALMENTE_PAGADO`, `PAGADO`, `PARCIALMENTE_DESPACHADO`, `DESPACHADO`, `ENTREGADO`, `CANCELADO_PARCIAL`, `CANCELADO`. No existe `EN_PREPARACION` (preparado ya cuenta como despachado). `estado_pago`: `PENDIENTE`, `PARCIALMENTE_PAGADO`, `PAGADO`, `CANCELADO`.
**Pendiente en este bloque:** `pedido_id` y `numero_pedido` en las respuestas de `/panel/ordenes` (hoy solo se puede cruzar por la orden).

### B6 — Pago único y reparto
- `POST /pedidos/{token_acceso}/pagar` (público) → `{ "client_secret", "monto", "moneda" }`, un PaymentIntent por el total del pedido, solo tarjeta. Repetirlo devuelve el mismo intento. `409 PAG-002` si el pedido es manual, venció o ya no admite pago. Una orden hija de un pedido de varias tiendas **no** se paga suelta por `/vitrina/{sub}/ordenes/{token}/pagar` (`PAG-002`).
- El webhook `payment_intent.succeeded` confirma todas las órdenes hijas en una transacción (idempotente; si el monto no coincide con la suma, rechaza todos los pagos).
- Reparto: cada orden pagada deja un asiento `{id, pedido_id, orden_id, tienda_id, tipo:"VENTA", bruto, comision, neto, moneda, fecha}` y suma al balance de su tienda. `GET /panel/balance/movimientos?pagina=` (tienda, permiso de métricas) · `GET /plataforma/repartos?pedido_id=&pagina=` (solo administrador).
- Tiempo real: `ORDEN_PAGADA` por cada tienda en `/topic/tienda/{id}/ordenes` y, para el comprador, `/topic/pedidos/{token_acceso}` con `{tipo:"PEDIDO_PAGADO", numero_pedido, estado, ocurrido_en}`.
- Pedido **manual**: cada tienda registra el pago de su orden con `POST /panel/ordenes/{id}/pagos/manual` (sin cambios). Mezclar manual y tarjeta en un pedido queda fuera.
- **Recorte (semana 3):** reembolso por orden hija sobre el cobro del pedido y su fila negativa en el libro; cupones multi-tienda ya funcionan por tienda.


---

## B7 y B8 cerrados en el backend (2026-11-12) — rama local `ajuste/R-001-mercado-perfil-plan-gratuito` (commit 5347974)

Estado: implementados y probados (`ResumenPropietarioTest` 3, `AdministracionTest` 6, módulo de usuario completo y arquitectura en verde). **No está en develop ni desplegado.** Los JSON salen de los DTOs y de las pruebas.

### B7 — `GET /propietario/resumen?desde=&hasta=` (sesión, sin tienda activa)
Solo las tiendas **de las que la persona es propietaria** (máx. 50). Rango por omisión: últimos 30 días en la zona de cada tienda; máx. 366 días; rango inválido → `422 MET-001`. **Cambio respecto de lo acordado:** los totales y la serie van **por moneda** (listas, no un objeto), porque las monedas distintas no se suman.
```json
{ "desde": "2026-10-14", "hasta": "2026-11-12",
  "totales": [ { "moneda": "USD", "ventas": 120.00, "ordenes": 4, "saldo_pendiente": 98.00 } ],
  "serie_dia": [ { "moneda": "USD", "fecha": "2026-11-12", "ventas": 40.00, "ordenes": 1 } ],
  "tiendas": [ { "tienda_id": "uuid", "nombre": "…", "subdominio": "…", "moneda": "USD", "estado_suscripcion": "ACTIVA",
                 "codigo_plan": "GRATIS", "operativa": true, "ventas": 120.00, "ordenes": 4, "saldo_pendiente": 98.00,
                 "alertas": { "ordenes_por_preparar": 1, "stock_bajo": 2 } } ] }
```
`ventas` = ventas netas (brutas menos reembolsos) del rango. `stock_bajo` = variantes publicadas, con inventario rastreado y sin venta sin stock, con 5 o menos unidades vendibles (umbral fijo).

### B8 — Administración (solo administrador de plataforma; el resto recibe `404 SEG-006`; todo paginado de 20)
- `GET /plataforma/tiendas?q=&estado=ACTIVA|INACTIVA&plan=&pagina=` → `{id, nombre, subdominio, esta_activa, moneda, duenio:{id, correo, nombre}, codigo_plan, estado_suscripcion, ventas_historicas, ordenes_pagadas, fecha_creacion}`. `GET /plataforma/tiendas/{id}` añade `correo_contacto, reembolsado, comisiones, saldo_pendiente, fin_periodo_actual, equipo:[{usuario_id, correo, nombre, rol}]`. Suspender y reactivar siguen en `POST /plataforma/tiendas/{id}/suspender|reactivar`.
- `GET /plataforma/usuarios?q=&estado=ACTIVO|INACTIVO|BLOQUEADO&pagina=` → `{id, correo, nombres, apellidos, esta_activo, bloqueado, bloqueado_hasta, dos_pasos_activo, es_administrador_plataforma, tiendas_propias, fecha_creacion}`. `GET /plataforma/usuarios/{id}` añade `telefono` y `tiendas:[{tienda_id, nombre, subdominio, rol}]`.
- Acciones (auditadas): `POST /plataforma/usuarios/{id}/bloquear` `{motivo}` (no vence solo; cierra sus sesiones; no puedes bloquearte a ti: `422 USR-015`), `POST …/desbloquear`, `POST …/cerrar-sesiones`.
- `GET /plataforma/auditoria?usuario_id=&entidad=&accion=&categoria=SEGURIDAD|NEGOCIO&desde=&hasta=&pagina=` → `{id, categoria, accion, entidad, entidad_id, usuario_id, tienda_id, motivo, detalle, fecha}`. Solo lectura.
- **Eventos de seguridad ahora auditados** (acción con prefijo `SEGURIDAD_`): `CUENTA_BLOQUEADA` (por intentos fallidos), `USUARIO_BLOQUEADO`, `USUARIO_DESBLOQUEADO`, `SESIONES_CERRADAS` (por la persona o por un administrador), `CLAVE_CAMBIADA`, `DOS_PASOS_CAMBIADO`. No se audita todavía el desbloqueo con código por correo ni la recuperación de clave.
- `GET /plataforma/pedidos?q=&pagina=` → `{id, numero_pedido, correo_cliente, moneda, total, pasarela, ordenes, ordenes_pagadas, fecha_creacion}`. Repartos: `GET /plataforma/repartos` (semana 2). Comisiones: `GET /plataforma/metricas/comisiones` (ya existía).
- **Rechazado/pendiente:** «sesiones activas» (el JWT es sin estado); activar o exigir dos pasos a otro usuario (opcional, no hecho); administradores con rol (B9).
