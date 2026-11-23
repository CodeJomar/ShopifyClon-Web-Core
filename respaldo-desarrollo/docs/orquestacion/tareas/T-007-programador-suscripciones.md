# T-007 — Programador de suscripciones y bloqueo del panel sin suscripción

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-007-programador-suscripciones` desde `develop` |
| Depende de | T-006 |
| Tamaño | M |

## Objetivo
Renovaciones y vencimientos automáticos (SUS-005/006/007/014/018) y el bloqueo de escrituras del panel cuando la suscripción no está vigente (SUS-017).

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/suscripciones.md` → SUS-005, 006, 007, 014, 017, 018 y la sección "Concurrencia"
- Código: `modulos/suscripcion/servicio/CobroSuscripcionServicio.java` (patrón T1 → pasarela → T2, **reutilízalo**), `modulos/tienda/**`, `comun/seguridad/ContextoTiendaInterceptor.java`, `comun/config/WebMvcConfig.java`.

## Alcance
1. **SUS-018**: en el T2 de un cobro `APROBADO`, guardar el `tokenPago` en `SuscripcionesTienda.ReferenciaPasarela`.
2. **`SuscripcionProgramador`** (`modulos/suscripcion/programador/`), `@Scheduled(cron = "${app.programador.suscripciones.cron:0 0 * * * *}")`, activo solo si `app.programador.habilitado=true` (por defecto `true`; en `application-test.properties` ponlo en `false`). Método público `ejecutar()` que las pruebas llaman directamente. Usa el `Clock`. Procesa **cada suscripción en su propia transacción**:
   - `PRUEBA` con `FinPeriodoActual ≤ ahora` → `VENCIDA`, `FechaVencimiento = ahora` (SUS-006).
   - `ACTIVA` con `FinPeriodoActual ≤ ahora`:
     - `CancelarAlFinalizarPeriodo` → `CANCELADA`, `FechaCancelacion = ahora`.
     - con `ReferenciaPasarela` → cobro de renovación con el mismo plan, ciclo y token (patrón de `CobroSuscripcionServicio`; el período nuevo empieza en el `FinPeriodoActual` anterior, no en `ahora`). Rechazado → `VENCIDA`.
     - sin token → `VENCIDA`.
   - Selección con consulta nativa `… FOR UPDATE SKIP LOCKED LIMIT 50` en un bucle hasta vaciar, para que dos instancias no procesen la misma fila. SUS-014 ya lo garantiza el índice `UxCobroAprobadoPeriodo`: si salta, se registra en log y se sigue.
   - Publica `SuscripcionVencidaEvento(tiendaId)` y `SuscripcionRenovadaEvento(tiendaId)` (records en `modulos/suscripcion/evento/`; nadie los escucha todavía).
3. **SUS-007** en el módulo `tienda` (para no crear el ciclo `suscripcion → tienda`): `TiendaProgramador` con el mismo cron y bandera. Una consulta nativa de solo lectura busca tiendas `EstaActiva = TRUE` cuya suscripción no cancelada está `VENCIDA` con `FechaVencimiento ≤ ahora − 30 días`. Las desactiva y audita `TIENDA_DESACTIVADA` con motivo "Suscripción vencida por más de 30 días".
4. **SUS-017**:
   - Anotación `@PermitidoSinSuscripcion` en `comun/seguridad` (de método o de clase). Ponla en el controlador de `/panel/suscripcion/**` y en activar/desactivar tienda.
   - `SuscripcionVigenteInterceptor` en `modulos/suscripcion/` (registrado con su propio `WebMvcConfigurer` del módulo, **después** de `ContextoTiendaInterceptor`): si la petición tiene `ContextoTienda` resuelto, el método HTTP es `POST`/`PUT`/`PATCH`/`DELETE`, la ruta empieza por `/panel/` y el handler no tiene `@PermitidoSinSuscripcion` → con suscripción vigente ausente o con `!permiteOperar()` lanza `ConflictoEstadoException("SUS-017", …)`.

## Criterios de aceptación (con pruebas; fija el reloj con un `Clock` de prueba o mueve fechas con `jdbc`)
- [ ] Prueba vencida → `VENCIDA`; ejecutar dos veces no cambia nada más.
- [ ] Activa vencida con token → renovada: 1 cobro `APROBADO` nuevo, período encadenado; dos ejecuciones seguidas → un solo cobro.
- [ ] Activa con `tok_rechazar` guardado → `VENCIDA`; sin token → `VENCIDA`; con cancelación programada → `CANCELADA`.
- [ ] Tienda `VENCIDA` desde hace 31 días → `EstaActiva = FALSE` con auditoría; desde hace 29 días → sigue activa.
- [ ] Con la suscripción `VENCIDA`: `PUT /panel/tienda` → 409 `SUS-017`; `GET /panel/tienda` → 200; `POST /panel/suscripcion/pagar` → funciona.
- [ ] Con `app.programador.habilitado=false` no se ejecuta nada por cron.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
