# T-003 — Reescribir el módulo `usuario` (identidad)

| Campo | Valor |
|---|---|
| Modelo sugerido | Sonnet |
| Repositorio | `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Api-Core` |
| Rama | `tarea/T-003-modulo-usuario` desde `develop` |
| Depende de | T-002 (mergeada) |
| Tamaño estimado | L — puntos de control con commit al final de cada uno |

## Objetivo
Reemplazar `modules/usuario` por `modulos/usuario`, con la arquitectura por capas y **todas** las reglas de `identidad.md`: registro con código de activación, login que devuelve las tiendas del usuario, recuperación de clave, perfil, cambio de contraseña y libreta de direcciones. Incluye la migración V3 y el límite de peticiones compartido. Al terminar no queda código del módulo viejo.

## Contexto obligatorio (leer solo esto)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\README.md` (reglas del ejecutor; **commits sin `Co-Authored-By`**)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\arquitectura-backend.md`
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\modulos\identidad.md` (**fuente de verdad** de esta tarea: reglas USR-001…013 y rutas)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\modulos\transversal.md` (códigos genéricos, `GEN-429`)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\05-decisiones.md` → solo D-023
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\base-de-datos\V003__identidad.sql`
- Código: todo `src/main/java/shopify/api/core/comun/**` (imitar su estilo), `modules/usuario/**` (solo para saber qué se borra), `modules/notificacion/**`, `src/test/java/shopify/api/core/**`.

## Estructura esperada
```text
modulos/usuario/
├── controlador/  AutenticacionControlador (/auth), CuentaControlador (/cuenta/perfil, /cuenta/contrasena),
│                 DireccionControlador (/cuenta/direcciones)
├── servicio/     AutenticacionServicio (registrar, activar, reenviarActivacion, login),
│                 RecuperacionClaveServicio (solicitar, confirmar), CuentaServicio (perfil, actualizar, cambiarContrasena),
│                 DireccionServicio, CodigoSeguridadServicio (emitir / verificar códigos; uso interno del módulo)
├── repositorio/  UsuarioRepositorio, TokenSeguridadRepositorio, DireccionUsuarioRepositorio
├── entidad/      UsuarioEntidad, TokenSeguridadEntidad, DireccionUsuarioEntidad
├── dto/request/  RegistroRequest, ActivarCuentaRequest, CorreoRequest, LoginRequest, RestablecerClaveRequest,
│                 ActualizarPerfilRequest, CambiarContrasenaRequest, DireccionRequest
├── dto/response/ LoginResponse, PerfilResponse, TiendaDeUsuarioResponse, DireccionResponse, RegistroResponse
├── modelo/       TipoCodigoSeguridad (enum con duración), TiendaDeUsuarioVista (proyección de interfaz)
├── mapeador/     UsuarioMapeador, DireccionMapeador (MapStruct)
└── evento/       CodigoActivacionEmitidoEvento, CodigoRecuperacionEmitidoEvento (records: correo, nombres, codigo)
```

---

## Punto de control 1 — Migración V3 y entidades
1. Copiar `docs/base-de-datos/V003__identidad.sql` **tal cual** a `src/main/resources/db/migration/V3__identidad.sql`.
2. Entidades (extienden `AuditoriaEntidad`, columnas entrecomilladas exactas):
   - `UsuarioEntidad`: `CorreoElectronico`, `ContrasenaHash`, `Nombres`, `Apellidos`, `Telefono`, `EstaActivo`, `EsAdministradorPlataforma` (se mapea normal, pero ningún DTO ni servicio lo escribe: solo se cambia en base de datos).
   - `TokenSeguridadEntidad`: `UUID usuarioId` (columna `UsuarioId`, sin `@ManyToOne`), `CodigoToken`, `Tipo` (`@Enumerated(STRING)` con `TipoCodigoSeguridad`), `FechaExpiracion`, `Usado`, `IntentosFallidos`.
   - `DireccionUsuarioEntidad`: todas las columnas de `"DireccionesUsuario"`, `UUID usuarioId`.
3. `TipoCodigoSeguridad`: `ACTIVACION_CUENTA(Duration.ofHours(24))`, `RECUPERACION_CLAVE(Duration.ofMinutes(30))`.
4. Ampliar `MigracionesTest`: la versión 3 está aplicada; `CLIENTE` y `ADMIN_TIENDA` tienen `"Eliminado" = TRUE`; existe la columna `"TokensSeguridad"."IntentosFallidos"`.
5. Commit: `feat(T-003): migracion V3 y entidades de usuario`.

## Punto de control 2 — Límite de peticiones (D-023, USR-009)
En `comun/seguridad` (transversal, lo usarán otros módulos):
- `@LimitarPeticiones(int porMinuto)` (anotación de método).
- `LimitadorPeticiones` (`@Component`): ventana fija de 60 s por clave `ip + " " + patrón de ruta del handler`, `ConcurrentHashMap`, limpieza de ventanas vencidas al consultar. Usa el `Clock` inyectado. Propiedad `app.limite-peticiones.habilitado` (por defecto `true`).
- `LimitePeticionesInterceptor` registrado en `WebMvcConfig` **antes** que `ContextoTiendaInterceptor`: si el método tiene la anotación y se superó el límite → `DemasiadasPeticionesException` (nueva en `comun/excepcion`, 429, código `GEN-429`, con los segundos restantes).
- `ManejadorExcepcionesGlobal`: para `DemasiadasPeticionesException` agrega el encabezado `Retry-After`.
- En `src/test/resources/application-test.properties`: `app.limite-peticiones.habilitado=false`. La prueba del limitador lo habilita con `@TestPropertySource`.
- Commit: `feat(T-003): limite de peticiones`.

## Punto de control 3 — Autenticación y recuperación
### Endpoints `/auth` (públicos; todos con `@LimitarPeticiones(porMinuto = 10)`)
| Método y ruta | Request (JSON snake_case) | Respuesta | Reglas |
|---|---|---|---|
| `POST /auth/registro` | `correo_electronico`, `contrasena`, `nombres`, `apellidos`, `telefono?` | 201 `{ id }` | USR-001, 002, 003 |
| `POST /auth/activar` | `correo_electronico`, `codigo` | 200 | USR-003, 012 |
| `POST /auth/reenviar-activacion` | `correo_electronico` | 200 (siempre, mismo mensaje) | USR-013, 006 |
| `POST /auth/login` | `correo_electronico`, `contrasena` | 200 `LoginResponse` | USR-004 |
| `POST /auth/recuperar-clave/solicitar` | `correo_electronico` | 200 (siempre, mismo mensaje) | USR-005, 006 |
| `POST /auth/recuperar-clave/confirmar` | `correo_electronico`, `codigo`, `contrasena_nueva` | 200 | USR-012, 006, 002 |

Validaciones de DTO: correo `@NotBlank @Email @Size(max=255)`; contraseña `@NotBlank @Size(min=8,max=72) @Pattern(regexp="^(?=.*[A-Za-z])(?=.*\\d).+$")` con mensaje "La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número"; nombres/apellidos `@NotBlank @Size(max=100)`; teléfono `@Size(max=30) @Pattern(regexp="^[0-9+ ()-]{6,30}$")` opcional; código `@NotBlank @Pattern(regexp="^\\d{6}$")`.

### `CodigoSeguridadServicio`
- `String emitir(UUID usuarioId, TipoCodigoSeguridad tipo)`: marca `Usado = TRUE` en los pendientes del mismo (usuario, tipo) (USR-006), genera `GeneradorToken.codigoNumerico(6)`, guarda `sha256Hex(codigo)`, expiración `ahora(Clock) + tipo.duracion()`, `IntentosFallidos = 0`. Devuelve el código en claro **solo** para el evento.
- `void verificarYConsumir(UUID usuarioId, TipoCodigoSeguridad tipo, String codigo)`: toma el pendiente más reciente no vencido (bloqueándolo con `PESSIMISTIC_WRITE`); si no hay → `ReglaNegocioException("USR-012", …)`; si el hash no coincide → `IntentosFallidos + 1`, y si llega a 5 `Usado = TRUE`; lanza `USR-012`. **Importante**: el incremento de intentos debe persistir aunque se lance la excepción: hazlo en una transacción `REQUIRES_NEW` (método en un bean aparte o `TransactionTemplate`) o lanza la excepción sin rollback (`@Transactional(noRollbackFor = ReglaNegocioException.class)` en el método que verifica). Si coincide → `Usado = TRUE`.
- Ningún código en claro en logs.

### `AutenticacionServicio`
- **Registrar**: normaliza correo (`trim().toLowerCase(Locale.ROOT)`); si existe (sin distinguir mayúsculas, incluidos eliminados) → 422 `USR-001`; guarda con BCrypt, `EstaActivo = FALSE`; emite código de activación; publica `CodigoActivacionEmitidoEvento`. Una carrera que viole `UxUsuariosCorreoMinusculas` también debe terminar en 422 `USR-001` (captura la `DataIntegrityViolationException` fuera de la transacción o haz `saveAndFlush` y tradúcela).
- **Activar**: usuario por correo (si no existe → `USR-012`, sin revelar); `verificarYConsumir`; `EstaActivo = TRUE`. Activar una cuenta ya activa → 200 sin efectos.
- **Reenviar**: si existe, no eliminada y no activa → emite y publica evento. Siempre 200 con "Si la cuenta existe y no está activada, te enviamos un código nuevo".
- **Login**: ver USR-004. Si el correo no existe, ejecutar igualmente `passwordEncoder.matches(clave, HASH_FICTICIO)` (hash calculado una vez al iniciar el bean). Orden: (1) usuario no existe o eliminado → 401 `USR-004`; (2) contraseña incorrecta → 401 `USR-004`; (3) no activo → 409 `USR-003`. Éxito: JWT con `JwtProveedor.generarToken(id, correo, Map.of())` (sin claim de rol) y `LoginResponse`:
  ```json
  { "token": "...", "tipo": "Bearer", "expira_en": "2026-10-15T03:00:00Z",
    "usuario": { "id", "correo_electronico", "nombres", "apellidos", "telefono", "es_administrador_plataforma", "fecha_creacion" },
    "tiendas": [ { "tienda_id", "nombre", "subdominio", "rol" } ] }
  ```
  Agrega a `JwtProveedor` un método público para conocer la expiración (`Instant calcularExpiracion(Instant emitido)` o similar). Las tiendas salen de una consulta nativa de solo lectura en `UsuarioRepositorio` con proyección `TiendaDeUsuarioVista`:
  ```sql
  SELECT t."Id" AS tiendaId, t."Nombre" AS nombre, t."Subdominio" AS subdominio,
         CASE WHEN t."PropietarioId" = :usuarioId THEN 'PROPIETARIO' ELSE r."Codigo" END AS rol
  FROM "Tiendas" t
  LEFT JOIN "PersonalTienda" p ON p."TiendaId" = t."Id" AND p."UsuarioId" = :usuarioId AND p."Eliminado" = FALSE
  LEFT JOIN "Roles" r ON r."Id" = p."RolId" AND r."Eliminado" = FALSE
  WHERE t."Eliminado" = FALSE
    AND (t."PropietarioId" = :usuarioId OR r."Codigo" IN ('ADMINISTRADOR', 'GESTOR_CATALOGO', 'GESTOR_PEDIDOS'))
  ORDER BY t."Nombre"
  ```

### `RecuperacionClaveServicio`
- **Solicitar**: si la cuenta existe y no está eliminada → emite código `RECUPERACION_CLAVE` y publica `CodigoRecuperacionEmitidoEvento`. Respuesta siempre 200 "Si el correo está registrado, te enviamos un código".
- **Confirmar**: usuario por correo (si no → `USR-012`); `verificarYConsumir`; nueva contraseña con BCrypt; invalida los demás pendientes de recuperación. Si la cuenta no estaba activa, **no** la activa.

### Eventos y notificación
- Crear los dos records en `modulos/usuario/evento` y **borrar** `comun/evento/UsuarioRegistradoEvento` y `CodigoRecuperacionGeneradoEvento`.
- Adaptar `modules/notificacion/.../EscuchadorNotificacionesUsuario` a los eventos nuevos: el correo dice "Tu código de activación es: 123456 (vence en 24 horas)" / "Tu código para restablecer la contraseña es: 123456 (vence en 30 minutos)". Sin enlaces con token. Logs sin código.

Commit: `feat(T-003): autenticacion y recuperacion de clave`.

## Punto de control 4 — Cuenta y direcciones
Rutas autenticadas (sin `X-Tienda-Id`; el usuario sale de `SesionActual.usuarioId()`):
| Método y ruta | Request | Respuesta | Reglas |
|---|---|---|---|
| `GET /cuenta/perfil` | — | `PerfilResponse` | — |
| `PUT /cuenta/perfil` | `nombres`, `apellidos`, `telefono?` | `PerfilResponse` | validaciones como en registro |
| `PUT /cuenta/contrasena` | `contrasena_actual`, `contrasena_nueva` | 200 | USR-010, USR-002 |
| `GET /cuenta/direcciones` | — | lista (principal primero, luego más recientes) | — |
| `POST /cuenta/direcciones` | `DireccionRequest` | 201 `DireccionResponse` | USR-008, USR-011 |
| `PUT /cuenta/direcciones/{id}` | `DireccionRequest` | `DireccionResponse` | 404 `USR-404` si no es suya o no existe |
| `DELETE /cuenta/direcciones/{id}` | — | 200 | eliminación lógica; USR-008 |
| `POST /cuenta/direcciones/{id}/principal` | — | `DireccionResponse` | USR-008 |

- `DireccionRequest`: `nombre_contacto` (obligatorio, ≤150), `telefono` (≤30), `direccion_linea1` (obligatorio, ≤255), `direccion_linea2` (≤255), `ciudad`, `estado_provincia` (obligatorios, ≤100), `codigo_postal` (obligatorio, ≤20), `pais` (obligatorio, ≤100), `es_principal` (opcional; solo se usa al crear).
- Cambiar la principal: primero `UPDATE … SET "EsPrincipal" = FALSE` de las del usuario (método `@Modifying` en el repositorio) y `flush`, después marcar la nueva; si no, el índice `UxDireccionPrincipalUsuario` falla.
- Todas las consultas filtran por `usuarioId` y `Eliminado = FALSE`.

Commit: `feat(T-003): cuenta y direcciones`.

## Punto de control 5 — Limpieza y pruebas
1. **Borrar** `src/main/java/shopify/api/core/modules/usuario/**` completo.
2. En `SecurityConfig`, quitar el bloque `// TEMPORAL … usuario (T-003)`. `/auth/**` ya es público.
3. En `Rutas`, quitar `USUARIOS_REGISTRO` y agregar las rutas nuevas. Borrar `PruebaEjemploHttpTest` (queda reemplazada).
4. Pruebas en `src/test/java/shopify/api/core/modulos/usuario/`. Para obtener los códigos en claro usa `@RecordApplicationEvents` + `ApplicationEvents` (captura `CodigoActivacionEmitidoEvento` / `CodigoRecuperacionEmitidoEvento`). Para vencer un código, actualiza `"FechaExpiracion"` con `jdbc`.

| Prueba | Esperado |
|---|---|
| registro válido | 201, fila con correo en minúsculas, `EstaActivo = FALSE`, token con hash de 64 hex (no el código) |
| registro con `Ana@X.com` cuando existe `ana@x.com` | 422 `USR-001` |
| contraseña sin número / de 7 caracteres / de 73 | 422 `VAL-001` con `validaciones.contrasena` |
| login antes de activar con clave correcta | 409 `USR-003` |
| login antes de activar con clave incorrecta | 401 `USR-004` |
| activar con código correcto | 200; luego login 200 con `token`, `usuario`, `tiendas = []` |
| activar con código incorrecto 5 veces y luego el correcto | 422 `USR-012` las 6 veces; `IntentosFallidos = 5`, `Usado = TRUE` |
| activar con código vencido | 422 `USR-012` |
| reenviar activación: el código anterior deja de servir y el nuevo funciona | ✔ |
| reenviar para correo inexistente | 200 con el mismo mensaje que para uno existente |
| login con correo inexistente / clave incorrecta | 401 `USR-004`, mismo mensaje |
| login devuelve tiendas: propietario (sin fila en personal), `GESTOR_PEDIDOS` en otra, y **no** una tienda eliminada ni una con rol `CLIENTE` | ✔ roles correctos |
| el token del login sirve en `GET /cuenta/perfil` | 200 |
| recuperar clave: solicitar (existe / no existe, misma respuesta), confirmar con código, login con la nueva; la vieja da 401 | ✔ |
| confirmar con código de activación en lugar del de recuperación | 422 `USR-012` |
| perfil: actualizar nombres y teléfono; teléfono inválido → 422 | ✔ |
| cambiar contraseña con actual incorrecta → 422 `USR-010`; igual a la actual → 422 `USR-010`; correcta → 200 y login con la nueva | ✔ |
| primera dirección queda principal; crear otra con `es_principal = true` cambia la principal | ✔ (una sola principal en base) |
| eliminar la principal con otras restantes → la más reciente pasa a principal | ✔ |
| dirección de otro usuario: ver/editar/eliminar → 404 `USR-404` | ✔ |
| la dirección 21 → 422 `USR-011` | ✔ |
| `GET /cuenta/perfil` sin token → 401 `SEG-007` | ✔ |
| `LimitePeticionesTest` (habilitado): 10 logins desde la misma IP → el 11.º da 429 `GEN-429` con `Retry-After`; otra IP (`remoteAddr`) no se ve afectada | ✔ |
| ningún log de la prueba contiene el código de 6 dígitos emitido | ✔ (captura la salida con `OutputCaptureExtension`) |

5. `ArquitecturaTest` debe pasar con el módulo ya incluido (ya no está vacío).
6. Commit: `test(T-003): pruebas del modulo usuario` y `refactor(T-003): eliminar modulo usuario anterior` (puede ir junto).

---

## Fuera de alcance
- Tiendas, personal, suscripciones (T-004/T-005). La consulta de tiendas del login es de solo lectura.
- Bloqueo de cuentas (Q-002), verificación de cambio de correo, eliminar cuenta, inicio de sesión social.
- Cambiar dependencias del `pom.xml`.

## Criterios de aceptación
- [ ] No existe `modules/usuario`; `git grep -n "modules.usuario" -- src` vacío.
- [ ] Ninguna ruta `/usuarios/**` responde (404 `GEN-404`).
- [ ] Ningún código de seguridad en claro en base, logs ni respuestas.
- [ ] El registro no acepta ni guarda rol alguno; `EsAdministradorPlataforma` no se puede escribir por la API.
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` incluido.
- [ ] Commits sin `Co-Authored-By`.

## Verificación (ejecutar y pegar resumen en el reporte)
```bash
mvn -q -DskipTests compile
mvn test
mvn test
git grep -n "modules.usuario\|UsuarioRegistradoEvento\|CodigoRecuperacionGeneradoEvento\|/usuarios/" -- src
git log --format='%h %s%n%b' develop..HEAD | grep -ci "co-authored"
```
(El `git grep` debe salir vacío y el conteo final debe ser `0`.)

## Riesgos y notas
- **No arranques la app contra Supabase**: al arrancar, Flyway aplicaría V3 en la base compartida. V3 ya está validada por el orquestador con datos equivalentes a los de Supabase; la aplicará el responsable.
- `BCrypt` ignora lo que pasa de 72 bytes: por eso el máximo de 72 en la validación.
- `@RecordApplicationEvents` registra los eventos publicados en el hilo de la prueba; la publicación ocurre dentro del servicio (antes del commit), así que se captura aunque el escuchador sea `AFTER_COMMIT` y `@Async`.
- El escuchador `@Async` puede seguir ejecutándose al terminar una prueba; el `JavaMailSender` está simulado, no afecta.
- Si un punto de control no cabe, detente con commit y pruebas en verde y repórtalo como parcial.
