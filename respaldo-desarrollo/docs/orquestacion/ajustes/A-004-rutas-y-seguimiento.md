# A-004 — Rutas de reparto, seguimiento del envío y punto de entrega

| Campo | Valor |
|---|---|
| Ejecutor | Sonnet (sesión del backend) |
| Repositorio | `ShopifyClon-Api-Core` |
| Rama | `ajuste/A-004-rutas-y-seguimiento` desde `develop` |
| Origen | Pedido del profesor (2026-11-03): guía de remisión, hoja de ruta y seguimiento de pedidos |
| Contraparte web | `docs/orquestacion-frontend/tareas/W-019-rutas-y-seguimiento.md` (sesión del frontend, rama `tarea/W-019-rutas-y-seguimiento`) |
| Tamaño estimado | M |

Este documento **es el contrato** entre backend y web. Si algo cambia (nombres, campos, códigos), se corrige aquí primero y se avisa a la sesión del frontend por mensaje. No se improvisa del lado de ninguno.

## Alcance (mínimo acordado con el usuario)
1. **Punto de entrega obligatorio**: el comprador marca su dirección en un mapa; la dirección de envío lleva `latitud` y `longitud`.
2. **Historial de eventos del envío** (el seguimiento).
3. **Hoja de ruta**: una ruta de reparto con chofer, placa, fecha y envíos ordenados.
4. **Foto de entrega** opcional al marcar un envío como entregado.
5. **Seguimiento público** por número de guía (último y menos prioritario; se implementa al final).

Fuera de alcance: GPS en vivo, optimización de rutas, firma, facturación electrónica oficial (la guía de remisión se arma en la web como documento imprimible, sin endpoint propio).

## 1. Punto de entrega (ENV-007)
- `DireccionEnvio` es un JSONB congelado en `Ordenes` (sin columnas nuevas en `Ordenes`): el snapshot incorpora **`latitud`** y **`longitud`** (números decimales).
- `CheckoutRequest.direccion_envio` recibe `latitud` (−90…90) y `longitud` (−180…180).
- **Regla ENV-007**: si alguna línea requiere envío, `latitud` y `longitud` son obligatorias. Si faltan → `422` con código **`ENV-007`** ("Marca en el mapa el punto de entrega"). Si ninguna línea requiere envío, no se exigen.
- Las órdenes antiguas sin coordenadas siguen siendo válidas: en las respuestas salen en `null`.
- `DireccionesUsuario` (libreta de direcciones del comprador): migración con **`Latitud` y `Longitud` (DECIMAL(9,6), NULL)** y los mismos campos en sus DTO de crear/editar/listar (opcionales ahí; son obligatorios solo al comprar).
- `OrdenDetallePanelResponse` y `OrdenPublicaResponse` exponen `direccion_envio.latitud/longitud` (ya salen dentro del snapshot; verificar que el mapeo no las pierda).

## 2. Historial de eventos del envío
Tabla nueva `EventosEnvio` (migración `V5__rutas_y_seguimiento.sql`, con las columnas de auditoría habituales):

| Columna | Tipo | Nota |
|---|---|---|
| `Id` | UUID | PK |
| `EnvioId` | UUID | FK a `Envios` |
| `Estado` | VARCHAR(50) | `CREADO`, `EN_TRANSITO`, `ENTREGADO`, `NO_ENTREGADO`, `DEVUELTO` |
| `Nota` | VARCHAR(500) NULL | motivo o comentario |
| `FotoUrl` | TEXT NULL | foto de entrega (solo con `ENTREGADO`, opcional) |
| `FechaEvento` | TIMESTAMPTZ | por defecto ahora |

- Cada transición de estado del envío (ENV-004) **inserta un evento**, incluida la creación (`CREADO`). Los envíos ya existentes no se migran (su historial empieza vacío).
- **`NO_ENTREGADO`** es nuevo: no cambia el estado del envío (sigue `EN_TRANSITO`), solo deja un evento con `Nota` obligatoria (la tienda lo reintenta o lo devuelve). `EN_TRANSITO → DEVUELTO` ya existe.
- La foto se sube con el almacenamiento de A-001 (`POST` de subida de imágenes ya existente); el evento solo guarda la URL resultante. Debe ser `https`.

### Endpoints (permiso `ORDENES_GESTIONAR`; **todos bajo `/panel`**, como el resto del panel)
Se reutilizan los endpoints de envío que ya existen (`/panel/envios/{id}/despachar|entregar|devolver`); cada uno pasa a **registrar su evento**.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/panel/envios/{envioId}/eventos` | Lista los eventos, más reciente primero. Elemento: `{ id, estado, nota, foto_url, fecha_evento }` |
| POST | `/panel/envios/{envioId}/entregar` | Igual que hoy, pero acepta cuerpo **opcional** `{ "foto_url": "https://..." , "nota": "..." }` |
| POST | `/panel/envios/{envioId}/no-entregado` | **Nuevo.** Cuerpo `{ "nota": "motivo" }` (obligatoria, máx. 500). No cambia el estado del envío; solo deja el evento |

Errores: transición inválida → el código que ya use ENV-004; `no-entregado` sin nota → `422` `VAL-001`; envío de otra tienda → `404`.

## 3. Hoja de ruta
Tablas nuevas (misma migración):

**`Rutas`**: `Id`, `TiendaId`, `Codigo` (correlativo por tienda, p. ej. `RT-0001`), `Fecha` (DATE), `Chofer` (VARCHAR 150), `Placa` (VARCHAR 20), `Estado` (`BORRADOR`, `EN_CURSO`, `FINALIZADA`), `Nota` NULL.

**`ParadasRuta`**: `Id`, `RutaId`, `EnvioId`, `Posicion` (INT, orden de visita, único por ruta). Un envío está en **una sola ruta activa** (no `FINALIZADA`).

Reglas:
- **RUT-001** Solo se agregan envíos de la misma tienda en estado `CREADO` o `EN_TRANSITO`.
- **RUT-002** Un envío no puede estar en dos rutas no finalizadas → `409` `RUT-002`.
- **RUT-003** Al pasar la ruta a `EN_CURSO`, los envíos `CREADO` pasan a `EN_TRANSITO` (con su evento y `FechaDespacho`).
- **RUT-004** La ruta pasa a `FINALIZADA` cuando el usuario lo pide; se permite con paradas pendientes (quedan sin cambiar).
- **RUT-005** Solo se edita (chofer, placa, paradas) mientras sea `BORRADOR`; en `EN_CURSO` solo se cambian estados de envío. Reordenar paradas se permite en `BORRADOR`.

### Endpoints (permiso `ORDENES_GESTIONAR`; todos bajo `/panel`)
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/panel/rutas` | Lista paginada; filtros `estado`, `fecha` |
| POST | `/panel/rutas` | Crea: `{ fecha, chofer, placa, nota?, envio_ids: [..] }` (el orden del arreglo es el orden de las paradas) |
| GET | `/panel/rutas/{id}` | Detalle con paradas |
| PUT | `/panel/rutas/{id}` | Edita datos y paradas (solo `BORRADOR`) |
| POST | `/panel/rutas/{id}/iniciar` | `BORRADOR → EN_CURSO` (RUT-003) |
| POST | `/panel/rutas/{id}/finalizar` | `EN_CURSO → FINALIZADA` |
| GET | `/panel/envios/disponibles-para-ruta` | Envíos `CREADO`/`EN_TRANSITO` sin ruta activa, para armar la ruta |

**Elemento de la lista (`RutaListaResponse`)**: `id`, `codigo`, `fecha` (`AAAA-MM-DD`), `chofer`, `placa`, `estado`, `total_paradas`, `paradas_entregadas`. Paginado como el resto (`Paginado<T>`).

**Detalle de ruta (`RutaDetalleResponse`)**: `id`, `codigo`, `fecha`, `chofer`, `placa`, `estado`, `nota`, `tienda` (`{ nombre, correo_electronico?, telefono?, direccion? }`, el remitente de la guía), `paradas[]`.
Cada **parada**: `posicion`, `envio_id`, `orden_id`, `numero_orden`, `numero_guia`, `estado_envio`, `destinatario`, `telefono`, `direccion` (objeto `{ direccion_linea1, direccion_linea2, ciudad, estado_provincia, codigo_postal, pais }`, el snapshot de la orden), `latitud`, `longitud` (nullable), `items[]` (`titulo_producto`, `titulo_variante`, `sku`, `cantidad`) — todo lo necesario para pintar la guía de remisión **sin más llamadas**.

**Envío disponible para ruta (`EnvioDisponibleResponse`)**: `envio_id`, `numero_orden`, `numero_guia`, `estado_envio`, `destinatario`, `ciudad`, `direccion_linea1`, `total_items` (suma de cantidades).

**Crear/editar (`RutaRequest`)**: `fecha` (`AAAA-MM-DD`, no pasada al crear), `chofer` (1–150), `placa` (1–20), `nota` (≤500, opcional), `envio_ids` (≥1, orden = orden de las paradas).

## 4. Seguimiento público (último)
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/seguimiento/{numero_guia}` | Público, sin sesión. Devuelve estado actual, empresa/chofer, fechas y la lista de eventos (sin datos personales: ni dirección ni teléfono) |

- El número de guía se genera al crear la ruta/envío si no lo tiene: formato `OT-AAAAMMDD-XXXXXX` (único). Si el envío ya trae `NumeroGuia` manual, se respeta.
- `404` genérico si no existe (no distinguir entre inexistente y de otra tienda).

## Criterios de aceptación
- [ ] Migración `V5` aplica sobre una base con datos (no rompe `MigracionesTest`).
- [ ] Prueba: checkout con envío sin coordenadas → `422 ENV-007`; con coordenadas → 201 y el detalle de la orden las devuelve; checkout sin envío (producto digital) sin coordenadas → 201.
- [ ] Prueba: cada transición del envío crea su evento; `NO_ENTREGADO` sin nota → 422; `ENTREGADO` con `foto_url` la guarda, sin ella también funciona.
- [ ] Prueba: crear ruta con 3 envíos respeta el orden; el mismo envío en otra ruta activa → `409 RUT-002`; iniciar la ruta pasa los envíos a `EN_TRANSITO`; editar una ruta `EN_CURSO` → rechazo.
- [ ] Prueba: un usuario de otra tienda no ve ni modifica rutas/envíos ajenos (404).
- [ ] `GET /seguimiento/{guia}` responde sin sesión y no expone datos personales.
- [ ] Se actualizan `docs/negocio/modulos/envios.md` (ENV-007, eventos), un `modulos/rutas.md` nuevo con RUT-001…005, y Swagger.
- [ ] `PuntaAPuntaTest` y las pruebas de checkout existentes siguen verdes (ajustar sus datos de prueba con coordenadas donde se compra con envío).
- [ ] Reporte en `docs/orquestacion/reportes/` y aviso a la sesión del frontend con el listado final de rutas y cualquier diferencia respecto a este contrato.

## Cómo se coordinan
- Orden sugerido de entrega: (1) ENV-007 + coordenadas en direcciones, (2) eventos de envío, (3) rutas, (4) seguimiento público. Avisar a la sesión del frontend al cerrar cada bloque, para que la web avance en paralelo.
- Sin `git push`. Commits sin coautor.
