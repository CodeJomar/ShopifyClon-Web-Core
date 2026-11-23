# Módulo: tiendas y personal

## Propósito
Alta y configuración de la tienda (inquilino), su vitrina pública básica y la gestión de su personal con roles.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Tiendas` | propietario, nombre, subdominio, dominio personalizado, moneda, correo de contacto, `TasaImpuesto`, `PreciosIncluyenImpuesto`, `ZonaHoraria`, `SiguienteNumeroOrden`, `EstaActiva` | subdominio único (incluidas eliminadas) |
| `PersonalTienda` | tienda, usuario, rol | un rol por (tienda, usuario) entre no eliminados |
| `Roles` | código | catálogo; la tienda lo lee |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| TIE-001 | Subdominio: se normaliza a minúsculas sin espacios; `^[a-z0-9](-?[a-z0-9])*$`, 3–63 caracteres, no reservado (`www`, `api`, `admin`, `app`, `panel`, `vitrina`, `auth`, `cuenta`, `plataforma`, `soporte`, `mail`), único en toda la plataforma (también frente a tiendas eliminadas). Error → 422 `TIE-001` con el motivo. | servicio + BD |
| TIE-002 | Crear tienda en **una** transacción (flujo `alta-de-tienda.md`). | servicio |
| TIE-003 | Un usuario activo puede ser propietario de varias tiendas. | servicio |
| TIE-004 | Tienda **operativa** = `EstaActiva` ∧ no eliminada ∧ suscripción vigente con `permiteOperar()` (`PRUEBA` o `ACTIVA`). Solo una tienda operativa muestra vitrina y aceptará checkout. | servicio (`TiendaServicio.esOperativa`) |
| TIE-005 | La moneda no se puede cambiar si la tienda tiene alguna orden → 409 `TIE-005`. | servicio |
| TIE-006 | `TasaImpuesto` entre 0 y 0.50; `ZonaHoraria` debe ser un id IANA válido (`ZoneId.of`); moneda ISO 4217 de 3 letras mayúsculas. | DTO + servicio + BD |
| TIE-007 | `SiguienteNumeroOrden` empieza en 1001 y solo lo modifica el checkout. | servicio |
| TIE-008 | Activar / desactivar la tienda solo lo hace el **propietario**, con auditoría. Desactivada: el panel sigue accesible; la vitrina no. | servicio |
| TIE-009 | Vitrina pública por subdominio: nombre, subdominio, moneda, correo de contacto, `precios_incluyen_impuesto`. Si no existe o no es operativa → 404 `TIE-404` "Esta tienda no está disponible". Nunca expone propietario, impuestos internos ni estado de suscripción. | servicio |
| PER-001 | Agregar personal: por correo de un usuario **registrado, activo y no eliminado**; si no → 422 `PER-001` "No hay una cuenta activa con ese correo. Pídele que se registre primero". | servicio |
| PER-002 | Respetar `LimitePersonal` del plan vigente: personal no eliminado **sin contar al propietario** < límite; si no → 422 `PER-002`. Sin suscripción vigente el límite es 0. | servicio |
| PER-003 | El rol `PROPIETARIO` no se asigna, cambia ni quita por esta vía, y al propietario no se le puede tocar → 422 `PER-003`. | servicio |
| PER-004 | `ADMINISTRADOR` solo gestiona roles `GESTOR_*` (asignar, cambiar desde/hacia, quitar); nunca a otro `ADMINISTRADOR` → 403 `PER-004`. | servicio |
| PER-005 | Cambiar rol y quitar personal exigen motivo (5–255 caracteres) y auditoría. Quitar = eliminación lógica. | servicio |
| PER-006 | El usuario ya es parte del personal (o es el propietario) → 409 `PER-006`. | servicio + índice parcial |
| PER-007 | Nadie cambia su propio rol ni se quita a sí mismo → 422 `PER-007`. | servicio |

## Permisos
| Acción | Permiso |
|---|---|
| Crear tienda, ver mis tiendas | usuario autenticado |
| Ver configuración de la tienda | cualquier miembro |
| Editar configuración | `TIENDA_CONFIGURAR` |
| Activar / desactivar | propietario (`ContextoTienda.esPropietario()`) |
| Listar / agregar / cambiar rol / quitar personal | `PERSONAL_GESTIONAR` (+ PER-004) |
| Vitrina por subdominio | público |

## Operaciones
| Operación | Ruta | Entrada | Salida | Errores |
|---|---|---|---|---|
| Crear tienda | `POST /cuenta/tiendas` | nombre, subdominio, correo de contacto, moneda?, plan? | 201: id, subdominio, suscripción (estado, plan, fin) | `TIE-001`, `SUS-015`, `VAL-001` |
| Mis tiendas | `GET /cuenta/tiendas` | — | lista (id, nombre, subdominio, rol, operativa) | — |
| Ver configuración | `GET /panel/tienda` | `X-Tienda-Id` | configuración completa | `SEG-001` |
| Editar configuración | `PUT /panel/tienda` | nombre, correo, dominio?, moneda, tasa, precios incluyen, zona | configuración | `TIE-005`, `TIE-006` |
| Activar / desactivar | `POST /panel/tienda/activar` · `/desactivar` | motivo? | configuración | 403 `SEG-002` si no es propietario |
| Personal | `GET /panel/personal` · `POST /panel/personal` · `PUT /panel/personal/{usuarioId}` · `DELETE /panel/personal/{usuarioId}` | correo, rol, motivo | miembro / lista | `PER-001…007` |
| Vitrina | `GET /vitrina/{subdominio}` | — | datos públicos | `TIE-404` |

## Casos límite
- Tienda desactivada: órdenes pendientes siguen su ciclo (pago manual, preparación, envío).
- Volver a agregar a alguien que fue quitado crea una fila nueva (la anterior queda eliminada).
