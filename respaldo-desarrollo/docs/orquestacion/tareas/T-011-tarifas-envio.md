# T-011 — Tarifas de envío (módulo `envio`, parte 1)

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-011-tarifas-envio` desde `develop` |
| Depende de | T-005 |
| Tamaño | S |

## Objetivo
CRUD de las tarifas de envío de la tienda, listado público en la vitrina y un método interno para el checkout. Los envíos (despacho) llegan en T-018.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/envios.md` → entidad `TarifasEnvio` y permisos (ENV-001/002 se usan en T-012/T-014)
- Tabla `"TarifasEnvio"` en `docs/base-de-datos/V002__suscripciones-y-ajustes.sql`
- Imitar **exactamente**: `modulos/tienda/**`.

## Alcance
1. `modulos/envio/` con `TarifaEnvioEntidad`, `TarifaEnvioRepositorio`, `TarifaEnvioServicio`, controladores, DTOs y mapeador.
2. Panel con `@RequierePermiso(ENVIOS_CONFIGURAR)`: `GET /panel/envios/tarifas` (ordenadas por `Orden`, luego nombre), `POST`, `PUT /{id}`, `DELETE /{id}` (lógica). Request: `nombre` (1–100), `descripcion?` (≤255), `precio` (≥ 0, 2 decimales), `monto_minimo_gratis?` (≥ 0), `esta_activa?` (por defecto `true`), `orden?` (por defecto 0). Otra tienda → 404 `ENV-404`.
3. Vitrina pública: `GET /vitrina/{subdominio}/tarifas-envio` → solo activas y no eliminadas: `id`, `nombre`, `descripcion`, `precio`, `monto_minimo_gratis`. Tienda inexistente o no operativa → 404 `TIE-404`. Para resolver el subdominio usa `TiendaServicio` del módulo `tienda` (si no tiene un método público `Optional<UUID> idOperativaPorSubdominio(String)`, agrégalo ahí con su prueba). `envio` **no** usa repositorios ni entidades de `tienda`.
4. Interno para el checkout: `TarifaEnvioServicio.buscarActiva(UUID tiendaId, UUID tarifaId)` → record `TarifaAplicable(id, nombre, precio, montoMinimoGratis)`; no existe, inactiva o de otra tienda → `ConflictoEstadoException("ENV-001", "El método de envío elegido no está disponible")`. Y `boolean tieneTarifasActivas(UUID tiendaId)`.
5. Actualizar en `docs/arquitectura-backend.md`, sección "Dependencias permitidas", la línea de `envio` a `envio ─► orden, tienda`.

## Criterios de aceptación (con pruebas)
- [ ] CRUD completo; precio negativo → 422; `GESTOR_PEDIDOS` → 403; tarifa de otra tienda → 404.
- [ ] La vitrina no muestra tarifas inactivas ni eliminadas; tienda desactivada → 404 `TIE-404`.
- [ ] `buscarActiva` con tarifa inactiva / de otra tienda → `ENV-001`.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
