# Módulo: identidad (usuarios)

## Propósito
Registro, activación, inicio de sesión, recuperación de clave, perfil y libreta de direcciones de cualquier persona (comerciante, personal o comprador). El rol en una tienda **no** se decide aquí (D-005).

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Usuarios` | correo, hash, nombres, apellidos, teléfono, `EstaActivo`, `EsAdministradorPlataforma` | correo único sin distinguir mayúsculas (`UxUsuariosCorreoMinusculas`) |
| `TokensSeguridad` | usuario, hash SHA-256 del código, `Tipo` (`ACTIVACION_CUENTA` / `RECUPERACION_CLAVE`), expiración, `Usado`, `IntentosFallidos` | consumo único |
| `DireccionesUsuario` | contacto, teléfono, líneas, ciudad, estado/provincia, código postal, país, `EsPrincipal` | una principal por usuario |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| USR-001 | El correo se guarda en minúsculas y sin espacios; es único sin distinguir mayúsculas. Registro con correo existente → 422 `USR-001` "Ya existe una cuenta con ese correo". | servicio + BD |
| USR-002 | Contraseña: 8–72 caracteres (límite de BCrypt), al menos una letra y un número. | DTO |
| USR-003 | Al registrarse, la cuenta queda `EstaActivo = FALSE` y se envía un **código de 6 dígitos** válido 24 h. Activar exige correo + código. | servicio |
| USR-004 | Login: correo inexistente, contraseña incorrecta o cuenta eliminada → 401 `USR-004` "Correo o contraseña incorrectos" (mismo mensaje y tiempo de respuesta similar: si el correo no existe se compara igual contra un hash ficticio). Contraseña **correcta** con cuenta sin activar → 409 `USR-003` "Tu cuenta aún no está activada. Revisa tu correo". | servicio |
| USR-005 | Solicitar recuperación siempre responde 200 con el mismo mensaje, exista o no el correo. Código de 6 dígitos válido 30 min, de un solo uso. Solo se envía si la cuenta existe y no está eliminada. | servicio |
| USR-006 | Generar un código nuevo invalida los códigos pendientes del mismo tipo de ese usuario. Restablecer la clave invalida todos los pendientes de recuperación. | servicio |
| USR-007 | Los códigos se guardan como SHA-256 hex, nunca en claro; nunca aparecen en logs ni respuestas. | servicio |
| USR-008 | Marcar una dirección como principal desmarca la anterior en la misma transacción. La primera dirección es principal. Si se elimina la principal y quedan otras, pasa a principal la más reciente. | servicio + índice parcial |
| USR-009 | Registro, login, activación, reenvío y recuperación tienen límite de 10 peticiones por minuto por IP y ruta → 429 `GEN-429`. | componente compartido |
| USR-010 | Cambiar contraseña con sesión exige la contraseña actual (422 `USR-010` si no coincide) y la nueva no puede ser igual a la actual. | servicio |
| USR-011 | Máximo 20 direcciones por usuario → 422 `USR-011`. | servicio |
| USR-012 | Un código admite 5 intentos fallidos; al quinto queda inválido y hay que pedir otro. Código incorrecto, vencido o agotado → 422 `USR-012` "El código no es válido o venció". | servicio |
| USR-013 | Reenviar código de activación: siempre responde 200; solo envía si la cuenta existe, no está activa ni eliminada; aplica USR-006. | servicio |

## Operaciones
| Operación | Ruta | Entrada | Salida | Errores |
|---|---|---|---|---|
| Registrar | `POST /auth/registro` | correo, contraseña, nombres, apellidos, teléfono | `{ id }` (201) | `USR-001`, `VAL-001` |
| Activar | `POST /auth/activar` | correo, código | ok | `USR-012` |
| Reenviar activación | `POST /auth/reenviar-activacion` | correo | ok (siempre) | — |
| Login | `POST /auth/login` | correo, contraseña | token, expiración, perfil, tiendas (id, nombre, subdominio, rol) | `USR-004`, `USR-003` |
| Solicitar recuperación | `POST /auth/recuperar-clave/solicitar` | correo | ok (siempre) | — |
| Restablecer | `POST /auth/recuperar-clave/confirmar` | correo, código, contraseña nueva | ok | `USR-012`, `VAL-001` |
| Perfil | `GET /cuenta/perfil` · `PUT /cuenta/perfil` | nombres, apellidos, teléfono | perfil | `VAL-001` |
| Cambiar contraseña | `PUT /cuenta/contrasena` | actual, nueva | ok | `USR-010` |
| Direcciones | `GET/POST /cuenta/direcciones` · `PUT/DELETE /cuenta/direcciones/{id}` · `POST /cuenta/direcciones/{id}/principal` | datos de dirección | dirección / lista | 404 `USR-404` si no es del usuario; `USR-011` |

## Eventos
- `CodigoActivacionEmitidoEvento` (registro y reenvío) y `CodigoRecuperacionEmitidoEvento` → notificación por correo **después del commit**.

## Preguntas abiertas
- Q-002: hoy `EstaActivo = FALSE` significa "sin activar". Cuando exista el bloqueo de cuentas (por fraude o soporte) hará falta una columna separada; hasta entonces no hay bloqueo.
