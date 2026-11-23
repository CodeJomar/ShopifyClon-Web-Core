# T-023 — Reescribir `notificacion`: correos de todos los eventos

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-023-notificaciones` desde `develop` |
| Depende de | T-019 (puede correr en paralelo con T-021 usando worktree: no tocan los mismos archivos) |
| Tamaño | M |

## Objetivo
Reemplazar el último código legado (`modules/notificacion`) por `modulos/notificacion`: un correo por cada evento de negocio, siempre **después del commit**, sin romper la operación si el correo falla.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/arquitectura-backend.md` → convenciones de eventos (`@TransactionalEventListener(AFTER_COMMIT)` + `@Async`)
- `docs/orquestacion/reportes/T-002.reporte.md` → sección "Revisión (Opus)" (MDC en `@Async` y doble registro del filtro JWT)
- Código: `modules/notificacion/**` (se borra), los records `*Evento` de `modulos/**/evento/` y `modulos/orden/modelo/`, `comun/config/ProgramacionConfig`, `comun/seguridad/jwt/JwtFiltroAutenticacion`.

## Alcance
1. **Infraestructura**:
   - Puerto `EnviadorCorreo` (`void enviar(String para, String asunto, String texto)`) con `SmtpEnviadorCorreo` sobre `JavaMailSender`. Propiedades: `app.correo.habilitado=${MAIL_ENABLED:true}`, `app.correo.remitente=${MAIL_FROM:no-responder@shopifyclon.test}`, `app.web.url-base=${APP_WEB_URL:http://localhost:3000}`. Deshabilitado → solo registra "correo omitido" (sin contenido).
   - En `ProgramacionConfig`: ejecutor de `@Async` (`ThreadPoolTaskExecutor`, 2–8 hilos) con un `TaskDecorator` que copia el MDC (id de correlación) al hilo. Con `app.async.sincrono=true` (ponlo en `application-test.properties`) el ejecutor corre en el mismo hilo, para que las pruebas sean deterministas.
   - Registrar `JwtFiltroAutenticacion` solo en la cadena de seguridad: `FilterRegistrationBean` con `setEnabled(false)`.
2. **Lecturas para armar los correos** (métodos públicos `readOnly` en el módulo dueño, con prueba; no uses repositorios ajenos):
   - `orden`: `DatosNotificacionOrden datosNotificacion(UUID ordenId)` → correo y nombre del cliente, número, total, moneda, `tokenAcceso`, `tiendaId`.
   - `tienda`: `DatosContactoTienda contacto(UUID tiendaId)` → nombre, subdominio, correo de contacto y correo del propietario (consulta nativa de solo lectura sobre `Usuarios`).
   - `envio`: `DatosEnvio datos(UUID envioId)` → transportista, guía, URL de seguimiento.
3. **Escuchadores** (`modulos/notificacion/escuchador/`, todos `@Async` + `@TransactionalEventListener(phase = AFTER_COMMIT, fallbackExecution = true)`; cualquier excepción se registra como advertencia y **no** se propaga):
| Evento | Para | Contenido mínimo |
|---|---|---|
| `CodigoActivacionEmitidoEvento` | usuario | código y vigencia (24 h) |
| `CodigoRecuperacionEmitidoEvento` | usuario | código y vigencia (30 min) |
| `OrdenCreadaEvento` | comprador **y** correo de contacto de la tienda | número, total, enlace `{url-base}/{subdominio}/ordenes/{token}` (comprador); "nueva orden" (tienda) |
| `OrdenPagadaEvento` | comprador | confirmación del pago |
| `OrdenCanceladaEvento` | comprador | cancelación y motivo |
| `EnvioDespachadoEvento` | comprador | transportista, guía y URL |
| `EnvioEntregadoEvento` | comprador | entrega |
| `SuscripcionVencidaEvento` | propietario | "tu suscripción venció, paga para seguir vendiendo" |
| `SuscripcionRenovadaEvento` | propietario | renovación |
- Textos en español, en `modulos/notificacion/modelo/Plantillas` (bloques de texto Java; sin dependencias nuevas).
- **Nunca** registrar en logs códigos, tokens, enlaces con token ni direcciones.
4. **Limpieza**: borrar `modules/` por completo y quitar la exclusión de `/modules/` en `ArquitecturaTest`.

## Criterios de aceptación (con pruebas; `JavaMailSender` ya es `@MockBean` en la base: captura los `SimpleMailMessage`)
- [ ] Cada evento de la tabla produce el correo al destinatario correcto con su contenido mínimo (una prueba por evento; publícalos dentro de un `TransactionTemplate` para que salten al commit).
- [ ] Un evento publicado en una transacción que hace rollback **no** envía correo.
- [ ] Si `JavaMailSender` lanza una excepción, la operación que publicó el evento termina bien y se registra una advertencia.
- [ ] Con `app.correo.habilitado=false` no se llama a `JavaMailSender`.
- [ ] El id de correlación aparece en el MDC del hilo del escuchador.
- [ ] No existe `src/main/java/shopify/api/core/modules`; `ArquitecturaTest` pasa sin exclusiones.
- [ ] Ningún log de las pruebas contiene un código de 6 dígitos ni un token emitido (`OutputCaptureExtension`).
- [ ] `mvn clean test` en verde dos veces; commits sin coautor.
