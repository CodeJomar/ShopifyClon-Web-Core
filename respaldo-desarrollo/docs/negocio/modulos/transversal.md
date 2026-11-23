# Módulo transversal: seguridad multi-tienda, auditoría y errores

## Propósito
Reglas que aplican a todos los módulos: contexto de tienda, permisos, auditoría y formato de errores.

## Reglas de negocio
| ID | Regla | Dónde se hace cumplir |
|---|---|---|
| SEG-001 | Toda ruta del panel (`/panel/**` o equivalentes de escritura) exige `X-Tienda-Id` válido; el usuario debe ser propietario o personal no eliminado de esa tienda. Si no, **404** `SEG-001`. | Componente compartido `ContextoTienda` (filtro/interceptor + resolvedor) |
| SEG-002 | Cada caso de uso del panel declara el permiso que exige (`@RequierePermiso(Permiso.X)` o verificación explícita al inicio). Sin permiso: **403** `SEG-002`. | Componente compartido + caso de uso |
| SEG-003 | El `TiendaId` se obtiene **solo** del contexto validado; nunca del cuerpo, la query o un `@PathVariable` sin validar. | Revisión de código + prueba |
| SEG-004 | Las consultas de recursos por id filtran también por `TiendaId` (`findByIdAndTiendaIdAndEliminadoFalse`). Un id de otra tienda responde 404. | Repositorio |
| SEG-005 | Rutas públicas de vitrina resuelven la tienda por subdominio y solo muestran datos publicados de tiendas operativas (TIE-004). | Caso de uso de vitrina |
| SEG-006 | Rutas de administración de plataforma (`/plataforma/**`) exigen `Usuarios.EsAdministradorPlataforma = TRUE`; si no, 404. | Componente compartido |
| SEG-007 | Sin sesión en ruta protegida: 401. Sesión válida sin permiso: 403. Recurso ajeno o inexistente: 404. Regla de negocio violada: 409 (estado) o 422 (dato). | `ManejadorExcepcionesGlobal` |
| AUD-001 | Las acciones sensibles (lista en `04-reglas-de-integridad.md`) insertan una fila en `RegistroAuditoria` **en la misma transacción**: tienda, usuario, acción, entidad, id, motivo y detalle JSON (antes/después). | Servicio compartido `Auditoria` |
| AUD-002 | `RegistroAuditoria` no se edita ni se borra. | Base de datos (sin rutas de escritura) + código |
| ERR-001 | Toda excepción de negocio lleva un código estable (`XXX-000`) y un mensaje en español para la persona. El 500 nunca expone detalles internos. | `ReglaNegocioException(codigo, mensaje, estadoHttp)` |

## Excepciones compartidas (contrato)
| Excepción | HTTP | Uso |
|---|---|---|
| `NoAutenticadoException` | 401 | No hay usuario en sesión |
| `AccesoDenegadoException` | 403 | Miembro sin el permiso |
| `RecursoNoEncontradoException` | 404 | No existe o es de otra tienda |
| `ConflictoEstadoException` | 409 | Transición no permitida, stock insuficiente, total distinto, idempotencia en curso |
| `ReglaNegocioException` | 422 | Dato que viola una regla (cupón vencido, límite de plan) |

## Códigos genéricos (no ligados a una regla de módulo)
| Código | HTTP | Cuándo | Mensaje |
|---|---|---|---|
| `SEG-001` | 400 | `X-Tienda-Id` ausente o mal formado en una ruta que exige tienda | "Debes indicar la tienda en la que trabajas" |
| `SEG-001` | 404 | Tienda inexistente, eliminada o de la que el usuario no es miembro | "No encontramos esa tienda" |
| `SEG-002` | 403 | Miembro sin el permiso | "Tu rol no tiene permiso para esta acción" |
| `SEG-006` | 404 | Ruta de plataforma sin ser administrador | "Recurso no encontrado" |
| `SEG-007` | 401 | Sin sesión, token inválido o vencido, o usuario desactivado/eliminado | "Inicia sesión para continuar" |
| `VAL-001` | 422 | Bean Validation falló (incluye `validaciones` por campo) | "Revisa los datos marcados" |
| `VAL-002` | 400 | Cuerpo JSON ilegible o tipo incorrecto | "No pudimos leer los datos enviados" |
| `VAL-003` | 400 | Parámetro de ruta/consulta con formato inválido (p. ej. UUID) | "El parámetro «x» no tiene un formato válido" |
| `GEN-404` | 404 | Ruta inexistente | "La ruta solicitada no existe" |
| `GEN-405` | 405 | Método HTTP no soportado | "Método no permitido en esta ruta" |
| `GEN-429` | 429 | Límite de peticiones superado (`@LimitarPeticiones`); incluye encabezado `Retry-After` en segundos | "Demasiados intentos. Espera un momento e inténtalo de nuevo" |
| `GEN-409` | 409 | Violación de unicidad/integridad no traducida por el servicio | "La operación entra en conflicto con datos existentes" |
| `GEN-500` | 500 | Cualquier otro error (se registra con el id de correlación) | "Ocurrió un error inesperado. Código de seguimiento: <id>" |

## Formato de respuesta (éxito y error)
`{ exito, codigo_estado, codigo (solo en error), mensaje, datos (éxito), detalles (opcional), validaciones (solo VAL-001), ruta (solo en error), id_correlacion, marca_tiempo }`

## Concurrencia
- `ContextoTienda` se resuelve una vez por petición y se guarda en `TenantContextHolder` (ya existe), limpiándose al terminar.

## Pruebas asociadas
| Regla | Prueba |
|---|---|
| SEG-001 | Usuario de la tienda A con `X-Tienda-Id` de B → 404 en crear producto, listar órdenes y ajustar stock |
| SEG-002 | `GESTOR_CATALOGO` intenta crear cupón → 403 |
| SEG-004 | Obtener producto de B con id real y contexto de A → 404 |
| AUD-001 | Ajuste de inventario genera fila de auditoría con motivo |
