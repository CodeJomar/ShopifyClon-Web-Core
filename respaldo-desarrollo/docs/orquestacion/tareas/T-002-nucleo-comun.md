# T-002 — Núcleo `comun/`: errores con código, seguridad multi-tienda, auditoría y utilidades

| Campo | Valor |
|---|---|
| Modelo sugerido | Sonnet |
| Repositorio | `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Api-Core` |
| Rama | `tarea/T-002-nucleo-comun` desde `develop` |
| Depende de | T-001 (mergeada) |
| Tamaño estimado | L — trabajar por los **puntos de control** indicados (commit al final de cada uno, compilando y con pruebas en verde) |

## Objetivo
Crear el paquete transversal `shopify.api.core.comun` sobre el que se reescribirán todos los módulos: respuesta y errores uniformes con código estable, sesión de usuario verificada, contexto de tienda validado con permisos por rol, auditoría atómica, id de correlación, eventos tras commit, utilidades y la prueba de arquitectura. Los módulos viejos (`modules/…`) **solo se adaptan para compilar**; no se reescriben aquí.

## Contexto obligatorio (leer solo esto)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\README.md` (reglas del ejecutor)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\arquitectura-backend.md` (completo)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\modulos\transversal.md` (completo: reglas SEG/AUD/ERR, códigos genéricos y formato de respuesta)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\01-actores-roles-permisos.md` (roles, permisos y matriz)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\base-de-datos\V002__suscripciones-y-ajustes.sql` (solo la tabla `RegistroAuditoria` y la columna `Usuarios.EsAdministradorPlataforma`)
- Código actual: `src/main/java/shopify/api/core/shared/**`, `src/main/java/shopify/api/core/config/**`, `ShopifyApplication.java`, `modules/notificacion/**`, y `src/test/java/shopify/api/core/soporte/**`.

## Estructura final esperada
```text
shopify.api.core.comun
├── config/       CorsConfig, OpenApiConfig, JpaAuditoriaConfig, WebMvcConfig, DotenvInitializer, RelojConfig, ProgramacionConfig
├── dto/          RespuestaApi, ConsultaPaginadaDto, PaginacionQueryInput, EstadoOperacionDto, ConsultaIndividualDto
├── excepcion/    ExcepcionNegocio (abstracta) + 6 subclases, ManejadorExcepcionesGlobal
├── seguridad/    SecurityConfig, jwt/{JwtProveedor, JwtFiltroAutenticacion, JwtPuntoEntradaAutenticacion},
│                 UsuarioAutenticado, SesionActual, UsuarioSesionRepositorio,
│                 Permiso, RolTienda, ContextoTienda, MembresiaTiendaRepositorio,
│                 ContextoTiendaInterceptor, ContextoTiendaResolver, RequierePermiso, SoloAdministradorPlataforma,
│                 AccesoDenegadoManejador, TenantContextHolder (@Deprecated)
├── auditoria/    AuditoriaEntidad (base JPA), AuditorAwareImpl, RegistroAuditoriaEntidad, RegistroAuditoriaRepositorio,
│                 AuditoriaServicio, AccionAuditoria
├── evento/       PublicadorEvento, UsuarioRegistradoEvento, CodigoRecuperacionGeneradoEvento (se mueven a usuario en T-003)
├── observabilidad/ CorrelacionFiltro
└── util/         Dinero, GeneradorSlug, GeneradorToken
```
Desaparecen: los paquetes `shared` y `config`, `ErrorRespuesta`, `BaseInputDto`, `SeguridadUtil`, `TenantInterceptor`.

---

## Punto de control 1 — Mover a `comun/` sin cambiar comportamiento
1. Mover todas las clases de `shared/**` y `config/**` a los paquetes de `comun/` según la estructura de arriba (usa `git mv` para conservar historial) y actualizar los imports en todo `src/main` y `src/test`.
2. `ShopifyApplication` sigue registrando `DotenvInitializer` desde su nueva ubicación.
3. `mvn test` en verde (las 6 pruebas de T-001). Commit: `refactor(T-002): mover shared y config a comun`.

## Punto de control 2 — Respuesta y excepciones con código
### Excepciones (`comun/excepcion`)
```java
public abstract class ExcepcionNegocio extends RuntimeException {
    private final String codigo;               // "CAT-003", "SEG-001", ...
    private final HttpStatus estado;
    private final Map<String, Object> detalles; // opcional, puede ser vacío; nunca null
}
SolicitudInvalidaException   → 400   (codigo, mensaje)
NoAutenticadoException       → 401   (codigo, mensaje)
AccesoDenegadoException      → 403   (codigo, mensaje)
RecursoNoEncontradoException → 404   (codigo, mensaje)
ConflictoEstadoException     → 409   (codigo, mensaje) y (codigo, mensaje, detalles)
ReglaNegocioException        → 422   (codigo, mensaje) y (codigo, mensaje, detalles)
```
- Para que los módulos viejos compilen sin reescribirlos: `ReglaNegocioException(String mensaje)` y `RecursoNoEncontradoException(String mensaje)` se conservan como constructores `@Deprecated` con código `"GEN-422"` y `"GEN-404"`. **Ningún código nuevo los usa.**

### `RespuestaApi` (`comun/dto`)
Campos (JSON `snake_case`, nulos omitidos): `exito`, `codigo_estado`, `codigo` (solo error), `mensaje`, `datos` (solo éxito), `detalles`, `validaciones` (solo VAL-001), `ruta` (solo error), `id_correlacion`, `marca_tiempo`.
- Conserva `ok(datos, mensaje)`, `creado(datos, mensaje)`, `paginado(page, mensaje)`.
- Reemplaza `error(...)` por `error(HttpStatus estado, String codigo, String mensaje, String ruta, Map<String,String> validaciones, Map<String,Object> detalles)`.
- `id_correlacion` se toma del MDC (`correlacionId`, ver punto 4) en éxito y error.
- Se elimina el campo `error` y la clase `ErrorRespuesta`.

### `ManejadorExcepcionesGlobal`
| Excepción | HTTP | Código | Notas |
|---|---|---|---|
| `ExcepcionNegocio` (todas) | el de la excepción | el de la excepción | `detalles` si no está vacío |
| `MethodArgumentNotValidException` | 422 | `VAL-001` | `validaciones` campo → mensaje; el campo en `snake_case` |
| `HttpMessageNotReadableException` | 400 | `VAL-002` | |
| `MethodArgumentTypeMismatchException`, `MissingServletRequestParameterException` | 400 | `VAL-003` | mensaje con el nombre del parámetro |
| `NoResourceFoundException`, `NoHandlerFoundException` | 404 | `GEN-404` | |
| `HttpRequestMethodNotSupportedException` | 405 | `GEN-405` | |
| `DataIntegrityViolationException` | 409 | `GEN-409` | registrar en log `warn` el nombre de la restricción, no el SQL |
| `AccessDeniedException` (Spring Security) | 403 | `SEG-002` | |
| `Exception` | 500 | `GEN-500` | log `error` con traza; mensaje "Ocurrió un error inesperado. Código de seguimiento: <id_correlacion>" |

Mensajes exactos: los de la tabla "Códigos genéricos" de `transversal.md`.

Commit: `feat(T-002): respuesta y excepciones con codigo`.

## Punto de control 3 — Sesión, contexto de tienda y permisos
### Sesión de usuario
- `UsuarioAutenticado` (record): `UUID id`, `String correo`, `boolean esAdministradorPlataforma`.
- `UsuarioSesionRepositorio` (`@Repository`, `NamedParameterJdbcTemplate`): `Optional<UsuarioAutenticado> buscarActivoPorId(UUID id)` → `SELECT "Id","CorreoElectronico","EsAdministradorPlataforma" FROM "Usuarios" WHERE "Id" = :id AND "EstaActivo" = TRUE AND "Eliminado" = FALSE`.
- `JwtFiltroAutenticacion`: si el token es válido **y** `buscarActivoPorId` devuelve el usuario, autentica con principal `UsuarioAutenticado`. Si el usuario no existe, está inactivo o eliminado, no autentica (la ruta protegida responderá 401 `SEG-007`).
- `SesionActual` (clase final con métodos estáticos que leen el `SecurityContext`): `UUID usuarioId()` (lanza `NoAutenticadoException("SEG-007", …)`), `Optional<UUID> usuarioIdOpcional()`, `Optional<UsuarioAutenticado> usuario()`, `boolean esAdministradorPlataforma()`.
- `AuditorAwareImpl` usa `SesionActual.usuarioIdOpcional()`.
- Reemplazar todos los usos de `SeguridadUtil` en los módulos viejos por `SesionActual` y borrar `SeguridadUtil`.
- `JwtPuntoEntradaAutenticacion` escribe `RespuestaApi` 401 `SEG-007`; `AccesoDenegadoManejador` (`AccessDeniedHandler`) escribe 403 `SEG-002`. Ambos con el `ObjectMapper` de Spring (snake_case).

### Permisos y roles
- `Permiso` (enum): `TIENDA_CONFIGURAR, SUSCRIPCION_GESTIONAR, PERSONAL_GESTIONAR, CATALOGO_GESTIONAR, INVENTARIO_AJUSTAR, CUPONES_GESTIONAR, ENVIOS_CONFIGURAR, ORDENES_VER, ORDENES_GESTIONAR, ORDENES_CANCELAR, REEMBOLSOS_EMITIR, METRICAS_VER`.
- `RolTienda` (enum): `PROPIETARIO, ADMINISTRADOR, GESTOR_CATALOGO, GESTOR_PEDIDOS`, cada uno con su `Set<Permiso>` **exactamente** según la matriz de `01-actores-roles-permisos.md` (`ADMINISTRADOR` = todo menos `SUSCRIPCION_GESTIONAR`; `GESTOR_CATALOGO` = `CATALOGO_GESTIONAR`, `INVENTARIO_AJUSTAR`; `GESTOR_PEDIDOS` = `ORDENES_VER`, `ORDENES_GESTIONAR`, `ORDENES_CANCELAR`). `static Optional<RolTienda> desdeCodigo(String)`.
- `ContextoTienda` (record): `UUID tiendaId`, `UUID usuarioId`, `RolTienda rol`. Métodos `boolean tiene(Permiso)`, `void exigir(Permiso)` → `AccesoDenegadoException("SEG-002", …)`, `boolean esPropietario()`.

### Resolución del contexto
- `MembresiaTiendaRepositorio` (`NamedParameterJdbcTemplate`, consulta de solo lectura permitida a `comun` por ser transversal):
  ```sql
  SELECT CASE WHEN t."PropietarioId" = :usuarioId THEN 'PROPIETARIO' ELSE r."Codigo" END AS rol
  FROM "Tiendas" t
  LEFT JOIN "PersonalTienda" p ON p."TiendaId" = t."Id" AND p."UsuarioId" = :usuarioId AND p."Eliminado" = FALSE
  LEFT JOIN "Roles" r ON r."Id" = p."RolId"
  WHERE t."Id" = :tiendaId AND t."Eliminado" = FALSE
    AND (t."PropietarioId" = :usuarioId OR p."Id" IS NOT NULL)
  LIMIT 1
  ```
  `Optional<String> buscarCodigoRol(UUID tiendaId, UUID usuarioId)`. Un código que no mapea a `RolTienda` (p. ej. `CLIENTE`) se trata como **sin membresía**.
  La tienda inactiva (`EstaActiva = FALSE`) **sí** permite entrar al panel (el propietario debe poder reactivarla).
- `ContextoTiendaInterceptor` (`HandlerInterceptor`), para toda petición con `HandlerMethod`:
  1. Si el método o su clase tiene `@SoloAdministradorPlataforma` y `!SesionActual.esAdministradorPlataforma()` → `RecursoNoEncontradoException("SEG-006", …)`.
  2. Determina si la ruta **exige** tienda: el método tiene `@RequierePermiso` o un parámetro de tipo `ContextoTienda`.
  3. Lee `X-Tienda-Id`. Si es exigida y falta o no es UUID → `SolicitudInvalidaException("SEG-001", "Debes indicar la tienda en la que trabajas")` (400). Si no es exigida y viene un valor inválido, se ignora.
  4. Si viene un UUID válido y hay usuario en sesión: `buscarCodigoRol`. Sin membresía → `RecursoNoEncontradoException("SEG-001", "No encontramos esa tienda")`. Con membresía: crea `ContextoTienda`, lo guarda como atributo de la petición y en `TenantContextHolder`.
  5. Si viene un UUID válido y **no** hay usuario en sesión: se ignora (las rutas públicas no usan contexto; las protegidas ya respondieron 401).
  6. Si el método tiene `@RequierePermiso(Permiso.X)` → `contexto.exigir(X)`.
  7. `afterCompletion` limpia `TenantContextHolder`.
- `ContextoTiendaResolver` (`HandlerMethodArgumentResolver`) inyecta el `ContextoTienda` del atributo de la petición en parámetros de ese tipo.
- `@RequierePermiso(Permiso value)` y `@SoloAdministradorPlataforma`: anotaciones de método (la segunda también de clase), `@Retention(RUNTIME)`.
- Registrar interceptor y resolver en `WebMvcConfig` (excluyendo Swagger). Eliminar `TenantInterceptor`.
- `TenantContextHolder` queda `@Deprecated` (solo para los módulos viejos; ahora solo contiene tiendas **validadas**). Los módulos nuevos reciben `ContextoTienda` por parámetro.
- Quitar `BaseInputDto`: borrar la clase y el `extends BaseInputDto` de los DTOs viejos; en `CrearProductoCasoUso` eliminar el respaldo `request.getIdTienda()` (si no hay tienda en el contexto, se mantiene la excepción que ya lanza).
- `OpenApiConfig`: ocultar `ContextoTienda` de la documentación (`SpringDocUtils.getConfig().addRequestWrapperToIgnore(ContextoTienda.class)` o `@Parameter(hidden = true)` vía `ParameterCustomizer`) y declarar el encabezado opcional `X-Tienda-Id` como componente reutilizable.

### `SecurityConfig`
- Públicas: `/auth/**`, `/vitrina/**`, `GET /planes`, `/webhooks/**`, Swagger. Además, **temporalmente** las públicas de los módulos viejos que hoy existen (`/usuarios/registro`, `/usuarios/login`, `/usuarios/activar-cuenta`, `/usuarios/recuperar-clave/**`, `GET /catalogo/productos/**`, `GET /catalogo/categorias/**`, `GET /tiendas/*`, `/pagos/webhook/**`) con el comentario `// TEMPORAL: se elimina al reescribir <modulo> (T-00X)`.
- Todo lo demás autenticado. Entry point y access denied handler de este punto.

Commit: `feat(T-002): sesion, contexto de tienda y permisos`.

## Punto de control 4 — Correlación, eventos, auditoría y utilidades
1. `CorrelacionFiltro` (`OncePerRequestFilter`, orden más alto): toma `X-Correlacion-Id` si es un texto de 8–64 caracteres `[A-Za-z0-9-]`, si no genera un UUID; lo pone en MDC `correlacionId`, lo devuelve en el encabezado de respuesta y limpia el MDC al final. En `application.properties`: `logging.pattern.level=%5p [%X{correlacionId:-}]`.
2. Eventos: `EscuchadorNotificacionesUsuario` pasa de `@EventListener` a `@TransactionalEventListener(phase = AFTER_COMMIT, fallbackExecution = true)` manteniendo `@Async`. **Quitar de los logs** el token y la URL de activación (USR-007/seguridad): registrar solo "Correo de activación enviado a {correo}" o el error. Mismo criterio para el correo de recuperación.
3. `ProgramacionConfig` con `@EnableScheduling`; mover `@EnableAsync` de `ShopifyApplication` a esa clase.
4. `RelojConfig`: `@Bean Clock reloj() { return Clock.systemUTC(); }`.
5. Auditoría:
   - `RegistroAuditoriaEntidad` (extiende `AuditoriaEntidad`) mapeando exactamente `"RegistroAuditoria"`; `Detalle` como `Map<String, Object>` con `@JdbcTypeCode(SqlTypes.JSON)`.
   - `RegistroAuditoriaRepositorio extends JpaRepository<RegistroAuditoriaEntidad, UUID>` (sin métodos de borrado expuestos más allá de los heredados; nadie los usa).
   - `AccionAuditoria` (enum): `TIENDA_CREADA, TIENDA_ACTIVADA, TIENDA_DESACTIVADA, TIENDA_SUSPENDIDA, TIENDA_REACTIVADA, PERSONAL_AGREGADO, PERSONAL_ROL_CAMBIADO, PERSONAL_QUITADO, PLAN_CAMBIADO, SUSCRIPCION_CANCELADA, PLAN_PRECIO_CAMBIADO, INVENTARIO_AJUSTADO, ORDEN_CANCELADA, ORDEN_CERRADA, ORDEN_REABIERTA, PAGO_MANUAL_REGISTRADO, PAGO_TARDIO_RECIBIDO, REEMBOLSO_EMITIDO`.
   - `AuditoriaServicio.registrar(UUID tiendaId, AccionAuditoria accion, String entidad, UUID entidadId, String motivo, Map<String,Object> detalle)` con `@Transactional(propagation = Propagation.MANDATORY)`: falla si no hay transacción (AUD-001: siempre atómica con el cambio). Toma `UsuarioId` de `SesionActual.usuarioIdOpcional()` e `IdCorrelacion` del MDC.
6. Utilidades (`comun/util`, clases finales con métodos estáticos salvo que se indique):
   - `Dinero`: `ESCALA = 2`, `RoundingMode.HALF_UP`; `redondear(BigDecimal)`, `CERO`, `multiplicar(BigDecimal, int)`, `porcentaje(BigDecimal base, BigDecimal tasa)` (tasa 0.18 = 18 %), `esPositivo(BigDecimal)`. `null` → `IllegalArgumentException`.
   - `GeneradorSlug.generar(String texto, int maxLongitud)`: minúsculas, sin tildes (NFD), `ñ`→`n`, todo lo que no sea `[a-z0-9]` pasa a `-`, guiones repetidos colapsados, sin guiones al inicio/fin, recorte a `maxLongitud` sin terminar en guion. Texto vacío resultante → `"item"`.
   - `GeneradorToken` (`@Component` con `SecureRandom`): `String tokenUrl()` (32 bytes, base64url sin relleno), `String codigoNumerico(int digitos)`, y `static String sha256Hex(String)`.

Commit: `feat(T-002): correlacion, eventos tras commit, auditoria y utilidades`.

## Punto de control 5 — Pruebas y guardia de arquitectura
Todas en `src/test/java/shopify/api/core/comun/` salvo que se diga otra cosa. Rutas en `Rutas`.

**Soporte** (amplía `PruebaIntegracionBase`, sin depender de los módulos viejos):
- `UUID crearUsuarioActivo(boolean adminPlataforma)` e `inactivarUsuario(UUID)` con `jdbc`.
- `UUID crearTienda(UUID propietarioId)` con `jdbc` (inserta en `"Tiendas"` con subdominio único), `void agregarPersonal(UUID tiendaId, UUID usuarioId, String codigoRol)`, `void eliminarTienda(UUID)`.
- `String tokenPara(UUID usuarioId, String correo)` usando el bean `JwtProveedor`.

**Controlador de prueba** en `src/test/java/shopify/api/core/comun/ControladorPruebaComun.java` (`@RestController`, ruta base `/prueba-comun`, solo existe en pruebas):
- `GET /panel` con parámetro `ContextoTienda` y `@RequierePermiso(Permiso.CUPONES_GESTIONAR)` → devuelve `rol` y `tienda_id`.
- `GET /panel-sin-permiso` con parámetro `ContextoTienda` y sin anotación.
- `GET /plataforma` con `@SoloAdministradorPlataforma`.
- `GET /error/{tipo}` que lanza cada subclase de `ExcepcionNegocio` (con `detalles` en la de 409) y un `RuntimeException` para el 500.
- `POST /validar` con un DTO `@Valid` (`@NotBlank nombre_campo`).
- `POST /auditar` que llama un servicio de prueba `@Transactional` que registra una auditoría, y `POST /auditar-sin-transaccion` que llama `AuditoriaServicio` directo.

**Pruebas** (`SeguridadContextoTiendaTest`, `RespuestaErroresTest`, `AuditoriaTest`):
| Caso | Esperado |
|---|---|
| `/panel` sin token | 401, `codigo = SEG-007`, `exito = false` |
| token de usuario inactivado | 401 `SEG-007` |
| token válido sin `X-Tienda-Id` | 400 `SEG-001` |
| `X-Tienda-Id` = `no-es-uuid` | 400 `SEG-001` |
| tienda de otro usuario | 404 `SEG-001` |
| tienda inexistente | 404 `SEG-001` |
| tienda eliminada | 404 `SEG-001` |
| propietario sin fila en `PersonalTienda` | 200, `rol = PROPIETARIO` |
| `ADMINISTRADOR` | 200 |
| `GESTOR_CATALOGO` en `/panel` (exige `CUPONES_GESTIONAR`) | 403 `SEG-002` |
| `GESTOR_CATALOGO` en `/panel-sin-permiso` | 200 |
| usuario con rol `CLIENTE` en `PersonalTienda` | 404 `SEG-001` |
| `/plataforma` con admin / sin admin | 200 / 404 `SEG-006` |
| cada `/error/{tipo}` | estado y código esperados; el 409 trae `detalles`; el 500 trae `GEN-500` y no expone el mensaje interno |
| `POST /validar` vacío | 422 `VAL-001` con `validaciones.nombre_campo` |
| `POST /validar` con JSON roto | 400 `VAL-002` |
| ruta inexistente autenticada | 404 `GEN-404` |
| encabezado `X-Correlacion-Id: prueba-123456` | la respuesta trae el mismo encabezado e `id_correlacion` |
| `/auditar` | fila en `"RegistroAuditoria"` con acción, usuario, `IdCorrelacion` y `Detalle` JSON legible |
| `/auditar-sin-transaccion` | 500 (la propagación `MANDATORY` lo impide) y **no** se insertó fila |

**Unitarias** (`comun/util` y `comun/seguridad`, sin Spring): `DineroTest`, `GeneradorSlugTest` (incluye "Camiseta Ñandú  Edición #1" → `camiseta-nandu-edicion-1`, texto solo símbolos → `item`, recorte), `GeneradorTokenTest` (longitud, unicidad en 1 000 llamadas, `sha256Hex("abc")` = `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`), `RolTiendaTest` (la matriz completa rol × permiso, caso por caso).

**`ArquitecturaTest`** (ArchUnit, importa `shopify.api.core`, excluye `..modules..` y clases de prueba), con `allowEmptyShould(true)` porque `modulos` aún está vacío:
1. `..comun..` no depende de `..modulos..` ni de `..modules..`.
2. `..modulos.*.controlador..` no depende de `..repositorio..` ni de `..entidad..`.
3. `..modulos.*.servicio..` no depende de `jakarta.persistence.EntityManager` ni de `jakarta.servlet..`.
4. `..modulos.*.repositorio..` no depende de `..dto..` ni de `..servicio..`.
5. Ningún paquete `modulos.X..` depende de `modulos.Y.repositorio..` ni `modulos.Y.entidad..` con X ≠ Y (condición personalizada o slices).
6. `slices().matching("..modulos.(*)..").should().beFreeOfCycles()`.

Commit: `test(T-002): seguridad, errores, auditoria, utilidades y arquitectura`.

---

## Fuera de alcance
- Reescribir `usuario`, `tienda`, `catalogo` o `notificacion` (solo los cambios mínimos indicados para compilar y el cambio del escuchador).
- Rutas nuevas reales (`/auth`, `/panel/…`): llegan con cada módulo.
- Límite de peticiones (USR-009), migración V3, entidades de V2 distintas de `RegistroAuditoria`.
- Cambiar dependencias del `pom.xml`.

## Criterios de aceptación
- [ ] No existen los paquetes `shopify.api.core.shared` ni `shopify.api.core.config`; tampoco `ErrorRespuesta`, `BaseInputDto`, `SeguridadUtil`, `TenantInterceptor`.
- [ ] Todo error HTTP de la API (incluidos 401 y 403 de Spring Security) responde con el formato de `transversal.md` y un `codigo`.
- [ ] Ninguna ruta usa un `TiendaId` no validado: `TenantContextHolder` solo se llena tras verificar membresía.
- [ ] La matriz de `RolTienda` coincide exactamente con `01-actores-roles-permisos.md` (prueba caso por caso).
- [ ] `AuditoriaServicio.registrar` falla fuera de una transacción.
- [ ] Los logs ya no contienen tokens de activación ni de recuperación.
- [ ] `mvn test` en verde, dos ejecuciones seguidas; las 6 pruebas de T-001 siguen pasando (si `PruebaEjemploHttpTest` cambia de estado esperado por el nuevo manejo de errores, ajústalo y explícalo en el reporte).
- [ ] `ArquitecturaTest` pasa.

## Verificación (ejecutar y pegar resumen en el reporte)
```bash
mvn -q -DskipTests compile
mvn test
mvn test
git grep -n "shopify.api.core.shared\|shopify.api.core.config\|SeguridadUtil\|BaseInputDto" -- src
git log --oneline develop..HEAD
```
(El `git grep` debe salir vacío.)

## Riesgos y notas
- **No arranques la app contra Supabase** para probar: todo se verifica con Testcontainers.
- El orden importa: `CorrelacionFiltro` antes del filtro JWT; el interceptor de contexto corre después de la autenticación (es de Spring MVC, así que ya hay `SecurityContext`).
- El interceptor no debe consultar la base cuando la ruta no trae `X-Tienda-Id`.
- Las excepciones lanzadas desde un `HandlerInterceptor` sí llegan al `@RestControllerAdvice`; verifícalo con las pruebas de 400/404/403.
- Si `@JdbcTypeCode(SqlTypes.JSON)` no inserta en `JSONB` con el driver actual, prueba `columnDefinition = "jsonb"` y anótalo.
- Si un punto de control no cabe, deténte al final del anterior con commit y pruebas en verde y repórtalo como parcial.
