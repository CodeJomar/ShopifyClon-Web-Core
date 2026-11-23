# T-022 — Calidad final: concurrencia, pendientes y prueba de punta a punta

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/T-022-calidad` desde `develop` |
| Depende de | T-021, T-023 |
| Tamaño | M/L — puntos de control con commit en cada uno |

## Objetivo
Cerrar el backend: probar con hilos las carreras que quedaron pendientes en los reportes, resolver los pendientes chicos y dejar una prueba que recorra el negocio completo de punta a punta.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/orquestacion/tablero.md` → "Observaciones pendientes de asignar"
- Las secciones "Pendiente" de `docs/orquestacion/reportes/T-006`, `T-007`, `T-008`, `T-009`, `T-013`, `T-016`, `T-017` y `T-019`
- `docs/negocio/04-reglas-de-integridad.md` → "Concurrencia e idempotencia"
- Código: lo que cada prueba ejercite. Patrón de concurrencia a imitar: la prueba de "última unidad" de `modulos/inventario` y la de `modulos/checkout` (`CountDownLatch`, un `TransactionTemplate` o una petición por hilo).

## Punto 1 — Pruebas de concurrencia (paquete `src/test/java/shopify/api/core/concurrencia/`)
Cada una con 2 hilos que arrancan juntos; documenta en el reporte el resultado observado. Si alguna revela un error, corrígelo en el mismo punto con su commit `fix(T-022): …`.
| Caso | Esperado |
|---|---|
| Dos ejecuciones simultáneas de `SuscripcionProgramador.ejecutar()` sobre la misma suscripción vencida con token | un solo cobro `APROBADO`, un solo período nuevo |
| Dos ejecuciones simultáneas de `OrdenVencimientoProgramador.ejecutar()` | cada orden vencida se anula una vez; reserva liberada una vez; uso de cupón devuelto una vez |
| Dos pagos simultáneos de la misma suscripción (`POST /panel/suscripcion/pagar`) | un cobro aprobado; el otro 409 `SUS-004` |
| Dos inicios de pago Stripe simultáneos de la misma orden | a lo sumo **un** pago `PENDIENTE`; si hoy se crean dos, bloquea la orden al iniciar y corrígelo |
| Dos reembolsos simultáneos que juntos superan lo cobrado | uno aprobado y el otro 422 `PAG-007`; nunca más reembolsado que cobrado |
| Dos `vincular` simultáneos del mismo usuario con carritos distintos | un solo carrito `ACTIVO` del usuario; sin 500 |
| Ajuste de inventario y reserva simultáneos sobre la misma variante | sin cantidades negativas indebidas; movimientos coherentes con las cantidades finales |

## Punto 2 — Pendientes chicos
1. **Cobros de suscripción huérfanos** (T-007): en `SuscripcionProgramador`, antes de procesar, marcar `RECHAZADO` los `CobrosSuscripcion` `PENDIENTE` con más de 1 hora (motivo en `DetallesRespuesta`). Prueba.
2. **SUS-003 de punta a punta** (T-006): cambiar el precio de un plan no altera el `PrecioPactado` del período en curso; sí lo usa la siguiente renovación.
3. **CAT-002** (T-008): editar el slug con uno inválido o repetido → 422 `CAT-002`.
4. **Limitador** (T-013): con `app.limite-peticiones.habilitado=true`, el 31.º `POST …/carrito` en un minuto → 429 `GEN-429`.

## Punto 3 — Prueba de punta a punta (`src/test/java/shopify/api/core/PuntaAPuntaTest.java`)
Un solo test, **solo por HTTP** (sin `jdbc` salvo para leer el código de activación y mover relojes), que recorre:
registro y activación del comerciante → login → `POST /cuenta/tiendas` → tarifa de envío → categoría → producto con 2 variantes e imagen → publicar → cupón 10 % → (comprador invitado) carrito con 2 líneas + cupón → checkout `MANUAL` → pago manual desde el panel → envío creado, despachado y entregado (orden `CERRADA`) → reembolso parcial con reposición de 1 unidad → `GET /panel/metricas` refleja venta, reembolso y comisión → `GET /cuenta/tiendas` y `GET /vitrina/{sub}/ordenes/{token}` coherentes.
Verifica en cada paso el código HTTP y los montos exactos (usa la tasa de impuesto de la tienda).

## Criterios de aceptación
- [ ] Las 7 pruebas de concurrencia pasan en 5 ejecuciones seguidas de esa clase (`mvn test -Dtest='*Concurrencia*'` ×5; pega las 5 cifras).
- [ ] Los 4 pendientes resueltos con prueba.
- [ ] `PuntaAPuntaTest` pasa y no usa servicios ni repositorios directamente.
- [ ] `mvn clean test` en verde dos veces; `ArquitecturaTest` pasa; commits sin coautor.
- [ ] El reporte incluye una tabla "Estado final del backend": módulos, número de pruebas y pendientes que quedan (para el rediseño web).
