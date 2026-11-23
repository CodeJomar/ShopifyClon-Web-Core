# Tablero y hoja de ruta (backend)

Estados: `pendiente` (sin MD) · `lista` (MD escrito) · `en curso` · `en revisión` · `correcciones` · `hecha` (mergeada a develop).
Cada tarea se escribe cuando su dependencia está hecha, para que refleje el código real.
Estrategia (D-022): cada módulo se **reescribe** según su MD con la arquitectura de `docs/arquitectura-backend.md`; su código viejo se borra en la misma tarea.

## Fase 0 — Fundaciones
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| T-001 | Flyway (V1 + V2), Testcontainers, base de pruebas de integración | Sonnet | — | hecha |
| T-002 | Núcleo `comun/`: excepciones con código y estados HTTP (ERR-001, SEG-007), `RespuestaApi` con código, JWT, `ContextoTienda` + `Permiso` + `@RequierePermiso` + admin de plataforma (SEG-001…006), auditoría compartida (AUD-001), eventos tras commit, utilidades (`Dinero`, `GeneradorSlug`, `GeneradorToken`, `Clock`), `ArquitecturaTest`. Los módulos viejos solo se adaptan para compilar | Sonnet | T-001 | hecha |

## Fase 1 — Identidad, tienda y suscripciones
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| T-003 | Reescribir `usuario` (USR-001…009): `/auth`, `/cuenta`, direcciones, tokens hasheados; V3 retira roles `CLIENTE`/`ADMIN_TIENDA` | Sonnet | T-002 | hecha |
| T-004 | Base de `suscripcion` y `balance`: entidades V2, listar planes públicos, servicio interno "crear prueba" y "crear balance" | Haiku | T-003 | hecha |
| T-005 | Reescribir `tienda` + personal: alta completa (flujo `alta-de-tienda`), configuración, personal (TIE-*, PER-*) | Sonnet | T-003, T-004 | hecha |
| T-006 | Suscripción del propietario y plataforma: pagar (cobro simulado), cambiar plan, cancelar, CRUD de planes, suspender (SUS-002…013) | Sonnet | T-005 | hecha |
| T-007 | Programador de suscripciones (SUS-005/006/007/014) y restricciones del panel con suscripción vencida (D-007) | Haiku | T-006 | hecha |

## Fase 2 — Catálogo, inventario y configuración comercial
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| T-008 | Reescribir `catalogo`: panel y vitrina, variantes múltiples, publicación, imágenes, límites de plan (CAT-001…012, SUS-011) | Sonnet | T-007 | hecha |
| T-009 | Módulo `inventario`: movimientos, ajuste con motivo, operaciones internas reservar/liberar/vender/reponer (INV-001…009) | Sonnet | T-008 | hecha |
| T-010 | Cupones CRUD + `ValidadorCupon` (CUP-001…009) | Haiku | T-005 | hecha |
| T-011 | Tarifas de envío CRUD (ENV-001/002 config) | Haiku | T-005 | hecha |

## Fase 3 — Compra
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| T-012 | `CalculadoraTotales` pura con pruebas unitarias exhaustivas | Haiku | T-010, T-011 | hecha |
| T-013 | Carrito (CAR-001…009) | Sonnet | T-009, T-012 | hecha |
| T-014 | Checkout idempotente con reserva y numeración (flujo `checkout`) | Sonnet (revisión Opus estricta) | T-013 | hecha |

## Fase 4 — Posventa
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| T-015 | Pagos manuales + confirmación de pago + balance + comisión (PAG-004/005, BAL-001) | Sonnet | T-014 | hecha |
| T-016 | Stripe en modo prueba + webhook idempotente (PAG-002/003/006) | Sonnet | T-015 | hecha |
| T-017 | Vencimiento de órdenes impagas + cancelación (ORD-007/008) | Haiku | T-015 | hecha |
| T-018 | Envíos: preparar, despachar, entregar, cierre (ENV-003…006) | Haiku | T-015 | hecha |
| T-019 | Reembolsos parciales y totales con reposición, y cancelación de órdenes pagadas (PAG-007/008, BAL-002, ORD-007) | Sonnet | T-016, T-017 | hecha |
| T-020 | Órdenes: listados del panel, "mis órdenes", estado por `TokenAcceso` (ORD-010…012) | Haiku | T-015 | hecha |
| T-021 | Métricas del panel (MET-001) | Haiku | T-019 | hecha |

## Fase 5 — Calidad
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| T-023 | Reescribir `notificacion`: correos de todos los eventos tras commit, MDC en `@Async`, borrar `modules/` | Haiku | T-019 | hecha |
| T-022 | Calidad final: concurrencia pendiente, pendientes chicos y prueba de punta a punta | Sonnet | T-021, T-023 | hecha |

## Ajustes pedidos por el frontend
Cambios de backend que surgen al construir la web. Tarea en `ajustes/A-XXX-<slug>.md`; mismo ciclo y reporte que las `T-XXX` (`reportes/A-XXX.reporte.md`).

| ID | Ajuste | Modelo | Origen | Bloquea | Estado |
|---|---|---|---|---|---|
| A-001 | Subida de imágenes a Supabase Storage (`POST /panel/archivos/imagenes`) | Sonnet | QW-004 | W-008 (solo "subir") | hecha |
| A-002 | IP real del visitante tras el proxy de la web (`X-Forwarded-For` con secreto compartido) para el limitador de peticiones | Haiku | revisión W-003 | despliegue | hecha |
| A-003 | Cotización del carrito con envío (`GET /vitrina/{sub}/carrito?tarifa_envio_id=` → `costo_envio` y total igual al del checkout) | Sonnet (sesión del backend) | revisión W-016 | checkout con envío sin CHK-004 sistemático | hecha |

- 2026-10-20 (responsable, commit `9c8ce4f` en `develop`): `.dockerignore` excluía `src/main/resources/db/`, así que la imagen Docker no llevaba las migraciones de Flyway (V3, V4 sin aplicar). Corregido; detectado al levantar la API para W-004.

## Observaciones pendientes de asignar
- La web (`ShopifyClon-Web-Core`) contiene pantallas de otro producto (POS, KDS, mesas, cajas); se descarta en el rediseño (Q-010).
- `Desarrollo/` no es un repositorio git: `docs/` no queda versionado.
- T-008: al borrar el último uso de `TenantContextHolder`, el `ContextoTiendaInterceptor` debe validar `X-Tienda-Id` solo en rutas que exigen tienda (hoy un encabezado ajeno da 404 también en la vitrina). Quitar entonces `TenantContextHolder`.
- `LimitadorPeticiones`: purgar ventanas con `@Scheduled` si el tráfico crece (hoy O(n) por petición).
- `notificacion`: escuchar eventos sin depender de paquetes internos de `usuario`; propagar el MDC a `@Async` con un `TaskDecorator`; deshabilitar el registro como filtro de servlet de `JwtFiltroAutenticacion`.
- Supabase ya tiene V1 y V2 (aplicadas a mano); `baseline-version=2`. Desde V3 las aplica Flyway.
- T-007: cobros de suscripción `PENDIENTE` huérfanos (fallo del proceso entre T1 y T2) bloquean la renovación; falta una limpieza (marcar `RECHAZADO` si llevan > 1 h). Pruebas de dos instancias del programador → T-022.
- T-008: la vitrina ordena por precio y pagina **en memoria**; pasar a SQL si el catálogo crece. Productos sin stock: se marcan, no se ocultan (D-025). Prueba de edición de slug (`CAT-002`) pendiente.
- `modules/notificacion` es el último código legado: reescribirlo como `modulos/notificacion` (eventos de usuario, suscripción y órdenes; MDC en `@Async`).
