# T-018 — Envíos: preparar, despachar y entregar (módulo `envio`, parte 2)

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-018-envios` desde `develop` |
| Depende de | T-015 |
| Tamaño | S/M |

## Objetivo
Registrar el despacho de una orden pagada y su entrega (ENV-003…006), moviendo la preparación de la orden.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/envios.md` → `Envios`, ENV-003…006
- Tabla `"Envios"` (`database.sql`) y `ChkEnviosEstado` / `UxEnviosOrden` (V2)
- Código: `modulos/envio/**` (imitar), `OrdenServicio.bloquear` / `marcarPreparada` / `marcarEntregada` (T-015).

## Alcance
- `EnvioEntidad`, `EstadoEnvio` (`CREADO`, `EN_TRANSITO`, `ENTREGADO`, `DEVUELTO`, con mapa de transiciones ENV-004), repositorio y `EnvioServicio`. Todo con `@RequierePermiso(ORDENES_GESTIONAR)`:
| Ruta | Regla |
|---|---|
| `POST /panel/ordenes/{ordenId}/envio` | ENV-003: request `empresa_transporte?` (≤100), `numero_guia?` (≤100), `url_seguimiento?` (`https://`), `fecha_entrega_estimada?`. Exige orden `ABIERTA` + `PAGADO` + `NO_PREPARADO` con alguna línea que requiera envío (si no → 409 `ENV-003`). Crea `Envios` `CREADO` y llama a `marcarPreparada`. Ya tiene envío → 409 `ENV-003` |
| `GET /panel/ordenes/{ordenId}/envio` (`ORDENES_VER`) | el envío de la orden o 404 `ENV-404` |
| `PUT /panel/envios/{envioId}` | ENV-006: edita transportista, guía, URL y fecha estimada si no está `ENTREGADO` (si no → 409) |
| `POST /panel/envios/{envioId}/despachar` | `CREADO → EN_TRANSITO`, `FechaDespacho` |
| `POST /panel/envios/{envioId}/entregar` | `EN_TRANSITO → ENTREGADO`, `FechaEntregaReal`, llama a `marcarEntregada` (que cierra la orden, ENV-005) |
| `POST /panel/envios/{envioId}/devolver` | `EN_TRANSITO → DEVUELTO` |
- Transición inválida → 409 `ENV-004`. Envío de otra tienda → 404 `ENV-404` (comprueba con `OrdenServicio.bloquear(tiendaId, ordenId)`).
- Publica `EnvioDespachadoEvento` y `EnvioEntregadoEvento` (nadie los escucha todavía).

## Criterios de aceptación (con pruebas; orden creada por checkout y pagada con el pago manual de T-015)
- [ ] Crear envío → orden `PREPARADO`; despachar → `EN_TRANSITO` con fecha; entregar → envío `ENTREGADO`, orden `ENTREGADO` y `CERRADA`.
- [ ] Orden no pagada o solo digital → 409 `ENV-003`; segundo envío → 409; entregar un `CREADO` → 409 `ENV-004`; URL `http://` → 422.
- [ ] `GESTOR_CATALOGO` → 403; otra tienda → 404.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
