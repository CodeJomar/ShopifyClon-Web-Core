# Guía de endpoints de la API (OTemu / ShopifyClon)

> Generada leyendo los controladores y los DTO de la rama `ajuste/A-004-rutas-y-seguimiento` (incluye A-001…A-004). Tiene 112 endpoints. Para el detalle exacto de cada campo, la fuente de verdad es el Swagger (`/api/v1/swagger-ui/index.html`) y las reglas de negocio están en `docs/negocio/modulos/*.md`. Lo que aquí diga "(ver código)" no lo verifiqué campo por campo.

## 0. Convenciones que aplican a todo

**Base**: `http://localhost:8080/api/v1` (el `/api/v1` es el `context-path`).

**JSON**: siempre `snake_case`; los campos nulos se **omiten** (no llegan como `null`).

**Sobre de respuesta** (éxito y error):
```json
{ "exito": true, "codigo_estado": 200, "mensaje": "…", "datos": { }, "id_correlacion": "…", "marca_tiempo": "…" }
{ "exito": false, "codigo_estado": 422, "codigo": "VAL-001", "mensaje": "Revisa los datos marcados",
  "validaciones": { "campo": "motivo" }, "detalles": { }, "ruta": "/…", "id_correlacion": "…" }
```
- Los **listados paginados** vienen como `datos: { datos: [...], total, pagina_actual, tamano_pagina, total_paginas, tiene_mas_paginas }` y se piden con `?pagina=0` (tamaño fijo de 20).
- Errores: 400 formato, 401 sin sesión (`SEG-007`), 403 sin permiso (`SEG-002`), 404 no existe / no es tuyo, 409 estado, 422 dato o regla, 429 demasiadas peticiones (`GEN-429`, trae `Retry-After`). El código estable (`CAT-003`, `ENV-007`…) es el id de la regla en `docs/negocio`.

**Cabeceras que hay que mandar**

| Cabecera | Cuándo | Para qué |
|---|---|---|
| `Authorization: Bearer <token>` | Rutas con sesión | El token sale de `POST /auth/login` |
| `X-Tienda-Id: <uuid>` | **Todas** las rutas `/panel/**` | Tienda sobre la que trabajas. Debes ser propietario o personal de esa tienda, si no: **404 `SEG-001`** (nunca 403). Falta o no es UUID: 400 `SEG-001` |
| `X-Carrito-Token` | Carrito y checkout | Token que devuelve `POST …/carrito` |
| `Idempotency-Key: <uuid>` | `POST …/checkout` | Evita crear dos órdenes si se repite la petición |
| `X-Correlacion-Id` | Opcional | 8–64 caracteres `A-Za-z0-9-`; vuelve en la respuesta y en los logs |

**Tres tipos de ruta**
- **Públicas**: `/auth/**`, `/vitrina/**`, `/planes`, `/seguimiento/{guía}`, `/webhooks/**`.
- **De cuenta** (solo sesión, sin `X-Tienda-Id`): `/cuenta/**`.
- **De panel** (sesión + `X-Tienda-Id` + permiso): `/panel/**`. Los **permisos** dependen del rol (ver §2): `PROPIETARIO` todo; `ADMINISTRADOR` todo menos suscripción; `GESTOR_CATALOGO` catálogo e inventario; `GESTOR_PEDIDOS` órdenes (ver, gestionar, cancelar).
- **De plataforma** (`/plataforma/**`): solo usuarios con `EsAdministradorPlataforma = true` (se marca en la base, no por la API); para los demás responde 404 `SEG-006`.

**Regla que sorprende (SUS-017)**: en el panel, **toda escritura** (POST/PUT/DELETE) responde **409 `SUS-017`** si la tienda no tiene suscripción que permita operar (`PRUEBA` o `ACTIVA`). Las lecturas siguen. Se exceptúan activar/desactivar la tienda y las acciones de `/panel/suscripcion/**`.

**Límite de peticiones**: por IP y ruta, en `/auth/*` y `POST /cuenta/tiendas` 10/min; checkout 20/min; crear carrito 30/min; seguimiento 30/min; pagar en línea 10/min.

---

## 1. Cuenta del usuario (módulo `usuario`)

### Autenticación — públicas
| Endpoint | Qué hace | Notas |
|---|---|---|
| `POST /auth/registro` | Crea la cuenta **sin activar** y manda un código de 6 dígitos por correo. | Contraseña 8–72 con letra y número. Correo duplicado (sin distinguir mayúsculas) → 422 `USR-001`. No acepta rol ni bandera de administrador. |
| `POST /auth/activar` | Activa con `{correo_electronico, codigo}`. | 5 intentos fallidos agotan el código (`USR-012`); vence en 24 h. Si ya estaba activa responde 200. |
| `POST /auth/reenviar-activacion` | Reenvía un código nuevo (invalida el anterior). | Siempre 200, exista o no el correo. |
| `POST /auth/login` | Devuelve `{token, tipo, expira_en, usuario, tiendas[]}`. | Cuenta sin activar con clave correcta → 409 `USR-003`. Clave o correo malos → 401 `USR-004` (mismo mensaje). `tiendas[]` trae `{tienda_id, nombre, subdominio, rol}` de las tiendas donde participas: **de ahí sacas el `X-Tienda-Id`**. |
| `POST /auth/login/verificar` | **Segundo paso del login** (A-007): `{correo_electronico, codigo}` → la misma respuesta del login con `token`. | Solo si la cuenta activó la verificación en dos pasos: entonces `POST /auth/login` responde `{requiere_segundo_factor: true}` **sin token** y manda un código (10 min, 5 intentos). Código malo o sin paso previo → 422 `USR-012`. |
| `POST /auth/desbloquear` | Levanta el bloqueo por intentos fallidos con `{correo_electronico, codigo}` (A-007). | Tras **5 contraseñas incorrectas seguidas** la cuenta se bloquea 15 min: el login responde 409 `USR-014` aunque la clave sea correcta y el dueño recibe un correo con el código (30 min). Un login correcto reinicia el contador. |
| `POST /auth/recuperar-clave/solicitar` | Envía un código (30 min). | Siempre 200. |
| `POST /auth/recuperar-clave/confirmar` | `{correo_electronico, codigo, contrasena_nueva}`. | No activa una cuenta que no estaba activa. Cierra las sesiones abiertas y levanta el bloqueo (A-007). |

> **Para que funcione**: el correo con el código lo envía `notificacion` por SMTP. En desarrollo, mira los logs o el correo configurado; el código nunca viene en la respuesta.

### Perfil — con sesión
| Endpoint | Qué hace |
|---|---|
| `GET /cuenta/perfil` | Tu perfil. |
| `PUT /cuenta/perfil` | Cambia nombres, apellidos y teléfono (`^[0-9+ ()-]{6,30}$`). |
| `PUT /cuenta/contrasena` | `{contrasena_actual, contrasena_nueva}`. Actual incorrecta o nueva igual → 422 `USR-010`. **Cierra todas las sesiones, incluida la actual** (A-007): hay que volver a iniciar sesión. |
| `POST /cuenta/cerrar-sesiones` | Invalida todos los tokens ya emitidos de la cuenta (A-007); responden 401 `SEG-007`. Sin cuerpo. |
| `PUT /cuenta/dos-pasos` | `{activo, contrasena_actual}` activa o desactiva el código por correo en el login (A-007). El perfil lo muestra en `dos_pasos_activo`. Clave incorrecta → 422 `USR-010`. |

> **Contraseñas (A-007):** además del formato (8–72, letra y número) se rechazan las demasiado comunes (`Password123`, `Qwerty123`…) y las que contienen el nombre del correo → 422 `USR-015`. Aplica al registro, al cambio y al restablecimiento.

### Libreta de direcciones — con sesión
| Endpoint | Qué hace | Notas |
|---|---|---|
| `GET /cuenta/direcciones` | Lista (la principal primero). | |
| `POST /cuenta/direcciones` | Agrega. 201. | Campos: `nombre_contacto, telefono?, direccion_linea1, direccion_linea2?, ciudad, estado_provincia, codigo_postal, pais, latitud?, longitud?, es_principal?`. La primera queda como principal; máximo 20 (`USR-011`). `latitud/longitud` son opcionales aquí. |
| `PUT /cuenta/direcciones/{id}` | Edita (no cambia la principal). | Ajena → 404 `USR-404`. |
| `DELETE /cuenta/direcciones/{id}` | Eliminación lógica. | Si era la principal, la más reciente pasa a serlo. |
| `POST /cuenta/direcciones/{id}/principal` | La marca como principal. | |

### Mis órdenes (comprador registrado) — con sesión
| Endpoint | Qué hace |
|---|---|
| `GET /cuenta/ordenes?pagina&tienda_id` | Historial de tus órdenes (todas las tiendas o una). |
| `GET /cuenta/ordenes/{ordenId}` | Detalle de una orden tuya. |

---

## 2. Tiendas y personal (módulo `tienda`)

| Endpoint | Permiso | Qué hace | Notas |
|---|---|---|---|
| `POST /cuenta/tiendas` | sesión | **Crea una tienda** y te hace `PROPIETARIO`. Body: `{nombre, subdominio, correo_contacto, moneda?, codigo_plan?}`. | Todo en una transacción: tienda, personal, balance, suscripción y auditoría. El **subdominio** (3–63, minúsculas/números/guiones, sin reservados, único incluso frente a eliminadas) es lo que luego va en `/vitrina/{subdominio}`. Defaults: `USD`, impuesto 0.18 incluido, `America/Lima`, primera orden `#1001`. La **primera tienda** recibe prueba de 14 días (plan `BASICO` por defecto, `SUS-015` si el plan no existe); **las siguientes del mismo usuario nacen `VENCIDA`** (no operativas) hasta que se pague. |
| `GET /cuenta/tiendas` | sesión | Mis tiendas con rol, `esta_activa` y `operativa`. | |
| `GET /panel/tienda` | cualquier miembro | Configuración completa + resumen de la suscripción. | |
| `PUT /panel/tienda` | `TIENDA_CONFIGURAR` | Edita nombre, correo, dominio, moneda, `tasa_impuesto` (0–0.50), `precios_incluyen_impuesto`, `zona_horaria` (IANA). | Cambiar la **moneda** con órdenes existentes → 409 `TIE-005`. |
| `POST /panel/tienda/activar` · `/desactivar` | **solo el propietario** | Cuerpo opcional `{motivo}`. | Desactivada: el panel sigue, la vitrina no. No exigen suscripción vigente. |
| `GET /panel/personal` | `PERSONAL_GESTIONAR` | Lista (propietario primero). | |
| `POST /panel/personal` | `PERSONAL_GESTIONAR` | `{correo_electronico, rol}`. | La persona **debe tener cuenta activa**, si no 422 `PER-001`. Roles: `ADMINISTRADOR`, `GESTOR_CATALOGO`, `GESTOR_PEDIDOS`. Límite del plan (`PER-002`). Un `ADMINISTRADOR` no puede gestionar a otro `ADMINISTRADOR` (403 `PER-004`). |
| `PUT /panel/personal/{usuarioId}` | `PERSONAL_GESTIONAR` | `{rol, motivo}` (motivo 5–255). | No te cambias a ti mismo (`PER-007`) ni al propietario (`PER-003`). |
| `DELETE /panel/personal/{usuarioId}` | `PERSONAL_GESTIONAR` | **Lleva cuerpo** `{motivo}`. | Eliminación lógica; la persona deja de entrar a la tienda (404 `SEG-001`). |
| `GET /vitrina/{subdominio}` | público | Datos públicos (nombre, moneda, correo, `precios_incluyen_impuesto`). | 404 `TIE-404` si la tienda no existe **o no es operativa** (desactivada o suscripción vencida). |

---

## 3. Suscripción y plataforma (módulos `suscripcion`, `balance`)

| Endpoint | Permiso | Qué hace | Notas |
|---|---|---|---|
| `GET /planes` | público | Planes públicos con precios y límites. | Úsalo antes de crear la tienda para elegir `codigo_plan`. |
| `GET /panel/suscripcion` | `SUSCRIPCION_GESTIONAR` (propietario) | Suscripción, período y uso frente a los límites. | |
| `POST /panel/suscripcion/pagar` | ídem | `{ciclo: MENSUAL\|ANUAL, token_pago, codigo_plan?}`. Cobra y activa. | La pasarela de suscripciones es **simulada**: aprueba cualquier `token_pago` salvo `tok_rechazar`. Es lo que saca a una tienda de `VENCIDA`. |
| `POST /panel/suscripcion/cambiar-plan` | ídem | `{codigo_plan, ciclo, token_pago}`. | |
| `POST /panel/suscripcion/cancelar` | ídem | `{motivo}`; se cancela al terminar el período. | |
| `POST /panel/suscripcion/revertir-cancelacion` | ídem | Deshace la cancelación programada. | |
| `GET/POST /plataforma/planes`, `PUT/DELETE /plataforma/planes/{codigo}` | admin plataforma | CRUD de planes, también los no públicos. | `porcentaje_comision` máximo 0.10. |
| `GET /plataforma/suscripciones?estado&pagina` | admin plataforma | Suscripciones de todas las tiendas. | |
| `POST /plataforma/tiendas/{tiendaId}/suspender` · `/reactivar` | admin plataforma | `{motivo}` (5–255). | La tienda suspendida no es operativa. |
| `GET /plataforma/metricas/comisiones?pagina` | admin plataforma | Comisiones por tienda. | |

> **Para que una tienda venda**: tiene que estar **activa** y con suscripción `PRUEBA` o `ACTIVA` ("operativa"). Una segunda tienda del mismo usuario nace `VENCIDA`: hay que llamar a `/panel/suscripcion/pagar` (o crear la tienda con la prueba por tienda activada por configuración) antes de poder crear productos, tarifas, etc., porque toda escritura de panel dará `SUS-017`.

---

## 4. Catálogo (módulo `catalogo`)

### Panel — `CATALOGO_GESTIONAR`
| Endpoint | Qué hace | Notas |
|---|---|---|
| `POST /panel/archivos/imagenes` | **Sube una imagen** (`multipart/form-data`, campo `archivo`, ≤ 5 MB; el tipo se detecta por los bytes). Devuelve `{url}` https. | Es el paso previo para imágenes de producto y fotos de entrega. Si el almacenamiento no está configurado responde error `ALM-001`. |
| `GET/POST/PUT/DELETE /panel/catalogo/categorias[/{id}]` | CRUD de categorías (`nombre`, `identificador_url?`, `descripcion?`). | El slug se genera del nombre si no lo mandas. |
| `GET /panel/catalogo/productos?pagina&texto&publicado&categoria_id` | Lista. | |
| `GET /panel/catalogo/productos/{id}` | Producto con variantes, imágenes y categorías (incluye costo unitario). | |
| `POST /panel/catalogo/productos` | Crea el producto **con sus variantes** (1–100). | Nace **no publicado**. Respeta el `limite_productos` del plan. Cada variante: `sku` (único por tienda, se guarda en mayúsculas), `precio`, y opcionales `cantidad_inicial`, `rastrea_inventario`, `permitir_venta_sin_stock`, `requiere_envio`, `precio_comparacion` (> precio), etc. |
| `PUT /panel/catalogo/productos/{id}` | Edita los datos del producto (no las variantes). | |
| `POST /panel/catalogo/productos/{id}/publicar` · `/despublicar` | Cambia la visibilidad. | **Publicar exige** título, al menos una variante con precio > 0 y una **imagen principal** (`CAT-007`). |
| `PUT /panel/catalogo/productos/{id}/categorias` | Reemplaza las categorías `{categoria_ids[]}`. | Categoría de otra tienda → 404. |
| `DELETE /panel/catalogo/productos/{id}` | Eliminación lógica. | |
| `POST /panel/catalogo/productos/{productoId}/variantes` · `PUT/DELETE /panel/catalogo/variantes/{id}` | Agregar, editar y quitar variantes. | No se elimina la última variante. Producto digital ⇒ `requiere_envio = false`. |
| `POST /panel/catalogo/productos/{productoId}/imagenes` · `PUT/DELETE /panel/catalogo/imagenes/{id}` | Imágenes: `{url_imagen (https), texto_alternativo?, variante_id?, posicion?, es_principal?}`. | La primera imagen es la principal; marcar otra desmarca la anterior. La `url_imagen` sale de `POST /panel/archivos/imagenes`. |

### Vitrina — públicas
| Endpoint | Qué hace | Notas |
|---|---|---|
| `GET /vitrina/{subdominio}/categorias` | Categorías con productos publicados. | |
| `GET /vitrina/{subdominio}/productos?pagina&texto&categoria&orden` | Productos publicados (nunca expone costos). | Solo si la tienda es operativa. |
| `GET /vitrina/{subdominio}/productos/{slug}` | Detalle por `identificador_url`. | De ahí salen los `variante_id` para el carrito. |

---

## 5. Inventario — `INVENTARIO_AJUSTAR`
| Endpoint | Qué hace | Notas |
|---|---|---|
| `GET /panel/inventario/variantes/{varianteId}` | Cantidades (disponible, reservada, vendible) y configuración. | |
| `PUT /panel/inventario/variantes/{varianteId}` | **Ajuste manual**: `{nueva_cantidad, motivo}` (motivo 5–255). | Fija la cantidad **física**; no puede ser menor que la reservada (`INV-007`). |
| `PUT /panel/inventario/variantes/{varianteId}/configuracion` | `{rastrea_inventario?, permitir_venta_sin_stock?}`. | |
| `GET /panel/inventario/variantes/{varianteId}/movimientos?pagina&desde&hasta` | Historial de movimientos. | Fechas ISO con hora. |

> Las cantidades solo cambian por este módulo, el checkout (reserva) y los pagos (venta/reposición). El stock se **reserva al crear la orden** y se **descuenta al confirmar el pago**.

---

## 6. Cupones — `CUPONES_GESTIONAR`
| Endpoint | Qué hace | Notas |
|---|---|---|
| `GET /panel/cupones?pagina&texto&activo` · `GET /panel/cupones/{id}` | Lista y detalle. | |
| `POST /panel/cupones` · `PUT /panel/cupones/{id}` | `{codigo, tipo_descuento, valor_descuento, monto_minimo_compra?, limite_usos_total?, fecha_inicio?, fecha_fin?, esta_activo?}` | `tipo_descuento`: `PORCENTAJE` (0–100), `MONTO_FIJO` (> 0) o `ENVIO_GRATIS` (valor **0**). El código se guarda en mayúsculas (`^[A-Z0-9_-]{3,50}$`). Con usos, no se puede cambiar tipo ni valor. |
| `DELETE /panel/cupones/{id}` | Eliminación lógica. | |

---

## 7. Tarifas de envío (módulo `envio`)
| Endpoint | Permiso | Qué hace | Notas |
|---|---|---|---|
| `GET/POST/PUT/DELETE /panel/envios/tarifas[/{id}]` | `ENVIOS_CONFIGURAR` | CRUD: `{nombre, descripcion?, precio, monto_minimo_gratis?, esta_activa?, orden?}`. | Con `monto_minimo_gratis`, el envío es 0 cuando `subtotal − descuento ≥ ese monto` (`ENV-002`). |
| `GET /vitrina/{subdominio}/tarifas-envio` | público | Tarifas **activas** para que el comprador elija. | De aquí sale `tarifa_envio_id`. |

> **Sin tarifas activas, ninguna compra con envío puede pagar el checkout** (`ENV-001`): crea al menos una antes.

---

## 8. Carrito (módulo `carrito`) — público
Todas llevan `X-Carrito-Token` (menos la primera).

| Endpoint | Qué hace | Notas |
|---|---|---|
| `POST /vitrina/{subdominio}/carrito` | Crea el carrito y devuelve su `token`. | **Guarda ese token** en el navegador: es la identidad del carrito. |
| `GET /vitrina/{subdominio}/carrito[?tarifa_envio_id=]` | Carrito recalculado con precios actuales. | **Cotización exacta (A-003)**: con `tarifa_envio_id` suma el envío y `total_estimado` es *idéntico* al total del checkout. Sin el parámetro, `costo_envio` no viaja y el total no incluye envío. Si ninguna línea requiere envío, la tarifa se ignora. Tarifa inactiva/ajena → 409 `ENV-001`. |
| `POST …/carrito/items` | `{variante_id, cantidad 1–99}` suma cantidades. | Avisa en `advertencias[]` si supera el stock, no falla. |
| `PUT …/carrito/items/{varianteId}` | `{cantidad 0–99}`; 0 quita la línea. | |
| `DELETE …/carrito/items/{varianteId}` | Quita la línea. | |
| `PUT …/carrito/cupon` | `{codigo}` aplica un cupón (reemplaza el anterior). | Si no aplica responde 422 `CUP-003` con el motivo. |
| `DELETE …/carrito/cupon` | Quita el cupón. | |
| `POST …/carrito/vincular` | Asocia el carrito a tu sesión (requiere `Authorization`) y fusiona con el que ya tengas. | |

---

## 9. Checkout (módulo `checkout`) — público
| Endpoint | Qué hace |
|---|---|
| `POST /vitrina/{subdominio}/checkout` | Convierte el carrito en una **orden** (201) o devuelve la ya creada con esa clave (200). |

**Para que funcione, en este orden:**
1. Cabeceras `X-Carrito-Token` e `Idempotency-Key` (un UUID **nuevo por intento de compra**; reusar la misma en un reintento devuelve la misma orden). Si mandas `Authorization`, la orden queda ligada a tu usuario; sin ella, es de invitado.
2. Body: `correo_cliente`, `nombre_cliente`, `telefono_cliente?`, `direccion_envio`, `direccion_facturacion?` (por defecto la de envío), `tarifa_envio_id`, `pasarela` (`MANUAL` o `STRIPE`) y **`total_esperado`**.
3. **`total_esperado`**: usa el `total_estimado` de `GET …/carrito?tarifa_envio_id=…` (con la **misma** tarifa y cupón). Si no coincide con lo que calcula el servidor → 409 `CHK-004` con `detalles.total_recalculado`.
4. **Si hay líneas con envío**: `direccion_envio` es obligatoria **y lleva `latitud` y `longitud`** (el punto marcado en el mapa); sin ellas → 422 **`ENV-007`**. También exige `tarifa_envio_id` activa (`ENV-001`). Si todo el carrito es digital, nada de eso se pide.
5. Respuesta: `orden_id`, `numero_orden` (`#1001`…), `total`, `token_acceso` y `fecha_expiracion_pago`. **Guarda `token_acceso`**: es lo que el comprador invitado usa para ver y pagar su orden.
6. Reserva el stock y consume el cupón; la orden vence (pago manual 48 h, Stripe 30 min) si no se paga.

Otros errores: `CHK-001` tienda no operativa, `CHK-002` nada vendible, `CHK-005` cupón dejó de aplicar, `CHK-006` clave usada con otro carrito, `CAR-008` carrito ya convertido, `INV-002` sin stock.

---

## 10. Órdenes, pagos y reembolsos

### Ver órdenes
| Endpoint | Permiso | Qué hace |
|---|---|---|
| `GET /panel/ordenes?pagina&estado&estado_pago&estado_preparacion&…` | `ORDENES_VER` | Listado con filtros (ver Swagger para fechas y texto). |
| `GET /panel/ordenes/{ordenId}` | `ORDENES_VER` | Detalle completo (incluye `direccion_envio` con coordenadas). |
| `GET /vitrina/{subdominio}/ordenes/{tokenAcceso}` | público | Estado de la orden para el invitado. |

### Pagos
| Endpoint | Permiso | Qué hace | Notas |
|---|---|---|---|
| `POST /vitrina/{subdominio}/ordenes/{tokenAcceso}/pagar` | público (10/min) | **Inicia el pago con Stripe**: devuelve `{client_secret, monto, moneda}`. | Solo para órdenes con `pasarela = STRIPE`, `PENDIENTE` y no vencidas. La web confirma con Stripe.js usando el `client_secret`. |
| `POST /webhooks/stripe` | público (firma) | Stripe confirma el pago; confirma la orden. | Requiere `Stripe-Signature` válida; idempotente. Es lo que marca la orden `PAGADO`, descuenta stock y suma al balance. |
| `POST /panel/ordenes/{ordenId}/pagos/manual` | `ORDENES_GESTIONAR` | Registra un pago manual por el total. Cuerpo opcional `{referencia}`. | Es la forma de pagar sin Stripe. Hace lo mismo que el webhook. |
| `GET /panel/ordenes/{ordenId}/pagos` | `ORDENES_VER` | Pagos y reembolsos de la orden. | |

### Cancelar y reembolsar
| Endpoint | Permiso | Qué hace | Notas |
|---|---|---|---|
| `POST /panel/ordenes/{ordenId}/cancelar` | `ORDENES_CANCELAR` | `{motivo: CLIENTE\|FRAUDE\|SIN_STOCK\|OTRO, detalle?, reponer_stock?}` | Solo si **no está preparada**. `detalle` es obligatorio con `OTRO`. Cancelar una orden **pagada** además exige `REEMBOLSOS_EMITIR`. |
| `POST /panel/ordenes/{ordenId}/reembolsos` | `REEMBOLSOS_EMITIR` | `{monto, motivo, reponer?: [{…}]}` parcial o total. | La suma de reembolsos no puede pasar de lo cobrado. |

---

## 11. Envío, rutas de reparto y seguimiento (A-004)

### Envío de una orden — `ORDENES_GESTIONAR` (lecturas con `ORDENES_VER`)
| Endpoint | Qué hace | Notas |
|---|---|---|
| `POST /panel/ordenes/{ordenId}/envio` | **Prepara la orden**: crea el envío (`CREADO`). Body `{empresa_transporte?, numero_guia?, url_seguimiento?, fecha_entrega_estimada?}`. | La orden debe estar **pagada** y tener líneas con envío (`ENV-003`). Si no mandas `numero_guia`, se genera `OT-AAAAMMDD-XXXXXX`. `url_seguimiento` debe ser https. |
| `GET /panel/ordenes/{ordenId}/envio` | El envío de la orden. | |
| `PUT /panel/envios/{envioId}` | Edita transportista, guía, URL y fecha estimada. | No si ya está entregado. |
| `POST /panel/envios/{envioId}/despachar` | `CREADO → EN_TRANSITO`. | |
| `POST /panel/envios/{envioId}/entregar` | `EN_TRANSITO → ENTREGADO`; la orden pasa a entregada (y a cerrada si ya está cobrada). Cuerpo **opcional** `{foto_url (https), nota}`. | La foto se sube antes con `POST /panel/archivos/imagenes` (necesita permiso de catálogo). |
| `POST /panel/envios/{envioId}/no-entregado` | Registra un intento fallido `{nota}` (**obligatoria**). | No cambia el estado: sigue `EN_TRANSITO`. |
| `POST /panel/envios/{envioId}/devolver` | `EN_TRANSITO → DEVUELTO`. | |
| `GET /panel/envios/{envioId}/eventos` | Historial (`CREADO`, `EN_TRANSITO`, `ENTREGADO`, `NO_ENTREGADO`, `DEVUELTO`), más reciente primero. | Cada transición deja su evento; los envíos anteriores a A-004 empiezan con historial vacío. |

### Rutas de reparto — `ORDENES_GESTIONAR`
| Endpoint | Qué hace | Notas |
|---|---|---|
| `GET /panel/envios/disponibles-para-ruta` | Envíos `CREADO`/`EN_TRANSITO` sin ruta activa. | Úsalo para armar la ruta. |
| `POST /panel/rutas` | Crea la ruta en `BORRADOR`: `{fecha, chofer, placa, nota?, envio_ids[]}`. | El **orden del arreglo es el orden de las paradas**. Fecha no pasada (zona de la tienda). `RUT-001` estado inválido, `RUT-002` el envío ya está en otra ruta activa, `ENV-404` envío ajeno. Código `RT-0001` correlativo por tienda. |
| `GET /panel/rutas?pagina&estado&fecha` | Lista con `total_paradas` y `paradas_entregadas`. | |
| `GET /panel/rutas/{id}` | Detalle para la **guía de remisión**: remitente, y por parada destinatario, teléfono, dirección, coordenadas e ítems. | Teléfono/dirección de la **tienda** aún no existen (salen ausentes). |
| `PUT /panel/rutas/{id}` | Edita datos y paradas. | Solo en `BORRADOR` (`RUT-005`). |
| `POST /panel/rutas/{id}/iniciar` | `BORRADOR → EN_CURSO` y **despacha** los envíos `CREADO`. | Otro estado → `RUT-003`. |
| `POST /panel/rutas/{id}/finalizar` | `EN_CURSO → FINALIZADA`. | Se puede con paradas pendientes; esos envíos vuelven a quedar disponibles. |

### Seguimiento público
| Endpoint | Qué hace | Notas |
|---|---|---|
| `GET /seguimiento/{numero_guia}` | Estado actual, transportista, chofer, fechas y eventos. **Sin sesión.** | Sin dirección ni teléfono. Guía inexistente → 404 `ENV-404` (no distingue de otra tienda). Si dos guías manuales coinciden, gana el envío más reciente. |

---

## 12. Métricas — `METRICAS_VER`
| Endpoint | Qué hace |
|---|---|
| `GET /panel/metricas?desde&hasta` | Resumen de ventas, serie por día y top de productos del período (`AAAA-MM-DD`). |

---

## 13. Recetas de punta a punta

**A. Dejar una tienda lista para vender (propietario)**
1. `POST /auth/registro` → `POST /auth/activar` (código por correo) → `POST /auth/login` (guarda `token`).
2. `GET /planes` (opcional) → `POST /cuenta/tiendas` (guarda `id` = **`X-Tienda-Id`** y el `subdominio`).
3. `POST /panel/envios/tarifas` (al menos una activa).
4. `POST /panel/archivos/imagenes` → `POST /panel/catalogo/productos` (con variantes y `cantidad_inicial`) → `POST …/productos/{id}/imagenes` (imagen principal) → `POST …/productos/{id}/publicar`.
5. Comprobar con `GET /vitrina/{subdominio}` y `GET /vitrina/{subdominio}/productos`.

**B. Una compra completa (comprador, con o sin cuenta)**
1. `POST /vitrina/{sub}/carrito` → guardar `token` → `POST …/carrito/items`.
2. `GET /vitrina/{sub}/tarifas-envio` → elegir `tarifa_envio_id` (y opcional `PUT …/carrito/cupon`).
3. `GET /vitrina/{sub}/carrito?tarifa_envio_id=…` → leer **`total_estimado`**.
4. El comprador marca su punto en el mapa → `POST /vitrina/{sub}/checkout` con `total_esperado = total_estimado`, `latitud/longitud`, `Idempotency-Key` nuevo → guardar `orden_id` y `token_acceso`.
5. Pago: `MANUAL` → el personal hace `POST /panel/ordenes/{id}/pagos/manual`; `STRIPE` → `POST /vitrina/{sub}/ordenes/{token_acceso}/pagar` y confirmar con Stripe.js (el webhook cierra el pago).

**C. Entregar un pedido**
1. `POST /panel/ordenes/{id}/envio` (la orden ya pagada) → copiar el `numero_guia`.
2. `GET /panel/envios/disponibles-para-ruta` → `POST /panel/rutas` → `POST /panel/rutas/{id}/iniciar` → imprimir la guía con `GET /panel/rutas/{id}`.
3. Por cada parada: `POST /panel/envios/{id}/entregar` (con `foto_url` opcional) o `…/no-entregado`; al terminar, `POST /panel/rutas/{id}/finalizar`.
4. El comprador sigue el pedido en `GET /seguimiento/{numero_guia}`.

## 14. Trampas frecuentes
- **404 `SEG-001` en el panel**: falta ser miembro de esa tienda, el `X-Tienda-Id` es de otra, o te quitaron del personal.
- **409 `SUS-017` al escribir**: la suscripción de la tienda no opera (segunda tienda `VENCIDA`, prueba terminada, suspendida). Pagar en `/panel/suscripcion/pagar`.
- **Vitrina 404 `TIE-404`**: tienda desactivada o no operativa, aunque exista.
- **`CHK-004` en la primera confirmación**: se calculó `total_esperado` sin pasar `tarifa_envio_id` a la cotización, o con otro cupón.
- **`ENV-007`**: el checkout con envío necesita `latitud` y `longitud` dentro de `direccion_envio`.
- **Publicar un producto falla**: falta imagen principal o precio > 0.
- **Cualquier `DELETE` con cuerpo**: `DELETE /panel/personal/{usuarioId}` exige `{motivo}`.
- **Sesión caducada**: el `token` expira (ver `expira_en` del login) y el servidor responde 401 `SEG-007`; la cuenta también se rechaza si se desactivó.
- **Pruebas**: el `Idempotency-Key` debe ser UUID válido o `CHK-007`.

---

## 15. Cobertura: controlador → sección

34 controladores y 112 endpoints, todos cubiertos. Las filas que agrupan un CRUD (categorías, tarifas, planes) o un par de acciones (`publicar`/`despublicar`, `activar`/`desactivar`, `suspender`/`reactivar`) cuentan cada verbo por separado.

| Módulo | Controlador | Endpoints | Sección |
|---|---|---|---|
| usuario | `AutenticacionControlador` | 6 | §1 |
| usuario | `CuentaControlador` | 3 | §1 |
| usuario | `DireccionControlador` | 5 | §1 |
| tienda | `TiendaCuentaControlador` | 2 | §2 |
| tienda | `TiendaPanelControlador` | 4 | §2 |
| tienda | `PersonalControlador` | 4 | §2 |
| tienda | `VitrinaTiendaControlador` | 1 | §2 |
| suscripcion | `PlanControlador` | 1 | §3 |
| suscripcion | `SuscripcionPanelControlador` | 5 | §3 |
| suscripcion | `PlataformaPlanControlador` | 4 | §3 |
| suscripcion | `PlataformaSuscripcionControlador` | 3 | §3 |
| balance | `PlataformaMetricasControlador` | 1 | §3 |
| comun | `ArchivosPanelControlador` | 1 | §4 |
| catalogo | `CategoriaPanelControlador` | 4 | §4 |
| catalogo | `ProductoPanelControlador` | 8 | §4 |
| catalogo | `VariantePanelControlador` | 3 | §4 |
| catalogo | `ImagenPanelControlador` | 3 | §4 |
| catalogo | `VitrinaCatalogoControlador` | 3 | §4 |
| inventario | `InventarioPanelControlador` | 4 | §5 |
| cupon | `CuponControlador` | 5 | §6 |
| envio | `TarifaEnvioPanelControlador` | 4 | §7 |
| envio | `TarifaEnvioVitrinaControlador` | 1 | §7 |
| carrito | `CarritoVitrinaControlador` | 8 | §8 |
| checkout | `CheckoutVitrinaControlador` | 1 | §9 |
| orden | `OrdenConsultaControlador` | 5 | §1 (cuenta) y §10 |
| pago | `PagoPanelControlador` | 2 | §10 |
| pago | `PagoEnLineaVitrinaControlador` | 1 | §10 |
| pago | `WebhookStripeControlador` | 1 | §10 |
| pago | `CancelacionOrdenPanelControlador` | 1 | §10 |
| pago | `ReembolsoPanelControlador` | 1 | §10 |
| envio | `EnvioPanelControlador` | 8 | §11 |
| ruta | `RutaPanelControlador` | 7 | §11 |
| seguimiento | `SeguimientoControlador` | 1 | §11 |
| balance | `MetricasControlador` | 1 | §12 |

Los 16 módulos son: `balance`, `carrito`, `catalogo`, `checkout`, `cupon`, `envio`, `inventario`, `notificacion`, `orden`, `pago`, `ruta`, `seguimiento`, `suscripcion`, `tienda`, `totales`, `usuario`. `notificacion` (correos tras commit) y `totales` (calculadora pura) **no exponen endpoints**; además, `comun` aporta la subida de imágenes (§4).


---

## 16. Rediseño R-001: endpoints nuevos (semanas 1 a 3)

Todo esto vive en la rama `ajuste/R-001-mercado-perfil-plan-gratuito` y **no está desplegado**. El detalle de cada JSON, los errores y las decisiones están en `docs/rediseno/01-necesidades-backend.md`; la página del laboratorio es `rediseno.html`. Convenciones de la §0 (envoltura, snake_case, fechas con `-05:00`).

### 16.1 Mercado público (sin sesión, 60 peticiones/min)
| Método y ruta | Para qué |
|---|---|
| `GET /mercado/productos` | Productos publicados de tiendas visibles. `q` (sin tildes), `categoria`, `tienda`, `precio_min`, `precio_max`, `orden=recientes\|precio_asc\|precio_desc`, `pagina`, `tamano` (máx. 48) |
| `GET /mercado/tiendas` · `GET /mercado/tiendas/{subdominio}` | Tiendas visibles; ficha con categorías (`404 TIE-404` si no está disponible) |
| `GET /mercado/categorias` · `GET /mercado/destacados` | Categorías agrupadas; tiendas y productos recientes para la landing |

Una tienda aparece si está operativa y con `visible_en_mercado`; un producto, si está publicado con imagen principal. `PUT /panel/tienda` acepta `descripcion`, `url_logo` (https) y `visible_en_mercado`.

### 16.2 Perfil y plan gratuito
- `GET /cuenta/perfil` y el login traen `acceso`: `es_comprador`, `es_propietario`, `es_administrador_plataforma`, `permisos_plataforma`, `rol_plataforma` y `tiendas[]` con rol y permisos.
- `GET /planes` incluye `GRATIS` y `es_gratuito` en cada plan. `POST /cuenta/tiendas` con `codigo_plan: "GRATIS"` nace activa sin pago. Errores: `409 SUS-018` (segunda tienda gratuita) y `409 SUS-019` (pagar o cambiar a GRATIS después).

### 16.3 Carrito global y pedido (comprador)
| Método y ruta | Para qué |
|---|---|
| `POST /carrito` · `GET /carrito` | Crear (token) y ver agrupado por tienda con `total_general` |
| `POST /carrito/items` · `PUT\|DELETE /carrito/items/{varianteId}` | Agregar (sin token crea uno), fijar cantidad (0 quita) y quitar. Otra moneda: `409 CAR-009` |
| `GET /carrito/tarifas` · `POST /carrito/cotizar` | Tarifas por tienda; cotizar con `{envios:[{tienda_id, tarifa_envio_id}]}` |
| `PUT /carrito/cupones` · `DELETE /carrito/cupones/{tiendaId}` | Cupón por tienda |
| `POST /carrito/vincular` | Con sesión: pasa el carrito a la persona |
| `POST /checkout` | `X-Carrito-Token` + `Idempotency-Key`: crea el pedido con una orden hija por tienda |
| `GET /pedidos/{token_acceso}` · `GET /cuenta/pedidos` · `GET /cuenta/pedidos/{id}` | Lectura del pedido (`404 PED-404`) |
| `POST /pedidos/{token_acceso}/pagar` | Un solo cobro con tarjeta por el total; devuelve `client_secret` |

`/vitrina/{sub}/carrito` y `/vitrina/{sub}/checkout` siguen funcionando (el checkout por tienda también crea un pedido de una orden). Una orden hija de un pedido de varias tiendas no se paga suelta (`409 PAG-002`). `/panel/ordenes` y su detalle traen `pedido_id` y `numero_pedido`.

### 16.4 Reparto
`GET /panel/balance/movimientos` (permiso `METRICAS_VER`, tienda activa) y `GET /plataforma/repartos` (permiso `PLATAFORMA_PEDIDOS`). Un asiento por orden pagada (`VENTA`) y uno negativo por cada reembolso (`REEMBOLSO`); el reembolso por orden hija usa `POST /panel/ordenes/{id}/reembolsos` de siempre.

### 16.5 Propietario y administración de plataforma
| Método y ruta | Permiso |
|---|---|
| `GET /propietario/resumen` | sesión; solo tiendas propias |
| `GET /plataforma/tiendas`, `/tiendas/{id}` | `PLATAFORMA_TIENDAS` |
| `POST /plataforma/tiendas/{id}/suspender\|reactivar` | `PLATAFORMA_SUSPENDER_TIENDAS` |
| `GET /plataforma/suscripciones` | `PLATAFORMA_TIENDAS` |
| `GET /plataforma/usuarios`, `/usuarios/{id}` | `PLATAFORMA_USUARIOS` |
| `POST /plataforma/usuarios/{id}/bloquear\|desbloquear\|cerrar-sesiones` | `PLATAFORMA_SEGURIDAD` |
| `GET /plataforma/auditoria` (`categoria=SEGURIDAD\|NEGOCIO`) | `PLATAFORMA_AUDITORIA` |
| `GET /plataforma/pedidos`, `/plataforma/repartos`, `/plataforma/metricas/comisiones` | `PLATAFORMA_PEDIDOS` |
| `/plataforma/planes` (CRUD) | `PLATAFORMA_PLANES` |
| `GET /plataforma/permisos`, `GET\|POST /plataforma/roles`, `PUT\|DELETE /plataforma/roles/{id}`, `GET\|POST /plataforma/administradores`, `PUT\|DELETE /plataforma/administradores/{usuarioId}` | `PLATAFORMA_ADMINISTRADORES` |

Quien no administra la plataforma recibe `404 SEG-006`; un administrador sin el permiso, `403 SEG-002`. Reglas de roles: nadie asigna permisos que no tiene (`403 ADM-001`), el superadministrador no se modifica por la API (`409 ADM-002`), nadie cambia su propia cuenta de administrador ni deja a la plataforma sin quien gestione administradores (`409 ADM-003`), los roles de sistema no se editan (`409 ADM-004`), un rol con administradores no se elimina (`409 ADM-005`).

### 16.6 Códigos nuevos
`CAR-009` moneda distinta · `PED-404` pedido · `SUS-018`/`SUS-019` plan gratuito · `USR-015` bloquearse a sí mismo · `ADM-001` a `ADM-009` roles y administradores.

---

## 17. Semilla de datos de demostración (R-014)

No agrega endpoints: se activa con variables de entorno al arrancar (`SEMILLA_DEMO=true` y `SEMILLA_DEMO_CONTRASENA`). Pasos, qué crea y garantías: `README.md` del backend, sección 7. Tras sembrar, estos endpoints ya devuelven datos:

| Qué mirar | Ruta |
|---|---|
| Mercado con 36 productos de 6 tiendas y estrellas | `GET /mercado/productos`, `/mercado/tiendas`, `/mercado/destacados` |
| Entrar como administrador | `POST /auth/login` con `admin.demo@otemu.test` |
| Seis tiendas, usuarios y pedidos de la plataforma | `GET /plataforma/tiendas`, `/plataforma/usuarios`, `/plataforma/pedidos` |
| Ventas de las tiendas de un propietario | `GET /propietario/resumen` (con `propietario.demo@otemu.test`) |
| Pedidos en varios estados del comprador | `GET /cuenta/pedidos` (con `comprador.demo@otemu.test`) |
