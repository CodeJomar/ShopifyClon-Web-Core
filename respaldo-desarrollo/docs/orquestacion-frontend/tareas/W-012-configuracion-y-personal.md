# W-012 — Configuración de la tienda y personal (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Antigravity (sin navegador), en worktree `Desarrollo/wt/W-012`, puerto 3100 |
| Rama | `tarea/W-012-configuracion-y-personal` desde `develop` |
| Depende de | W-007-C1 (mergeada) |
| Tamaño | M |

## Objetivo
El propietario o el administrador edita los datos de su tienda (nombre, contacto, moneda, impuesto, zona horaria), el propietario la activa o desactiva con motivo, y se gestiona el personal: agregar por correo con rol, cambiar el rol con motivo y quitar con motivo. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md`, `docs/negocio/01-actores-roles-permisos.md` (roles y matriz)
- `docs/negocio/modulos/tiendas-y-personal.md` (TIE-005, TIE-006, TIE-008, PER-001…007)
- Código a imitar: `src/modules/cupones/` (W-010: lista + `FormPanel` + confirmación + mapeo de errores), `src/modules/panel/hooks/use-panel.tsx` (`puede`, `rol`, `tienda`), marcadores `src/app/panel/{configuracion,personal}/page.tsx`

## Contrato de la API (verificado por Opus; JSON en `snake_case`; con `X-Tienda-Id`)
**Tienda**
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Ver | `GET /panel/tienda` | `{ id, nombre, subdominio, dominio_personalizado?, moneda, correo_contacto, tasa_impuesto, precios_incluyen_impuesto, zona_horaria, esta_activa, operativa, suscripcion: { estado, codigo_plan, fin_periodo_actual }, fecha_creacion }` |
| Editar (permiso `TIENDA_CONFIGURAR`) | `PUT /panel/tienda` | `{ nombre (≤ 100), correo_contacto (≤ 255), dominio_personalizado? (≤ 150), moneda (^[A-Z]{3}$), tasa_impuesto (0 a 0.50), precios_incluyen_impuesto, zona_horaria (≤ 50, id IANA) }` · 409 `TIE-005` si cambia la moneda con órdenes |
| Activar / desactivar (solo `PROPIETARIO`) | `POST /panel/tienda/activar` · `POST /panel/tienda/desactivar` | `{ motivo? (≤ 255) }` (TIE-008; confirmar en Swagger si el motivo es obligatorio) |

**Personal** (permiso `PERSONAL_GESTIONAR`)
| Acción | Endpoint | Cuerpo |
|---|---|---|
| Listar | `GET /panel/personal` | `[{ usuario_id, correo_electronico, nombres, apellidos, rol, desde }]` |
| Agregar | `POST /panel/personal` | `{ correo_electronico (≤ 255), rol: "ADMINISTRADOR" \| "GESTOR_CATALOGO" \| "GESTOR_PEDIDOS" }` |
| Cambiar rol | `PUT /panel/personal/{usuarioId}` | `{ rol, motivo (5–255) }` |
| Quitar | `DELETE /panel/personal/{usuarioId}` | `{ motivo (5–255) }` (cuerpo en un DELETE: verificar que el proxy de la web lo reenvía) |

Errores de personal: `PER-001` (no hay cuenta activa con ese correo), `PER-002` (límite del plan), `PER-003` (no se toca al propietario), `PER-004` (un administrador solo gestiona gestores), `PER-006` (ya es parte del personal o es el propietario), `PER-007` (no cambiarse a uno mismo).

## Pantallas
| Ruta | Muestra / permite |
|---|---|
| `/panel/configuracion` | Formulario con los datos de la tienda (el subdominio es de solo lectura, con su enlace a la vitrina); `tasa_impuesto` se muestra y se escribe en **porcentaje** (18 ↔ 0.18) y se envía como fracción; zona horaria con una lista corta de ids IANA de LatAm (`America/Lima` por defecto) que acepte también otros. Bloque "Estado de la tienda": activa/inactiva, operativa, plan y fin del periodo; botones "Desactivar tienda" / "Activar tienda" con confirmación y motivo, **solo para `PROPIETARIO`** |
| `/panel/personal` | Lista del personal (nombre, correo, rol en español, "desde"); el propietario se muestra primero sin acciones; "Agregar personal" en `FormPanel` (correo y rol); por fila "Cambiar rol" (rol + motivo) y "Quitar" (confirmación + motivo). Un `ADMINISTRADOR` solo ve las acciones sobre gestores (PER-004); la API decide igual |

- Roles en español: Propietario, Administrador, Gestor de catálogo, Gestor de pedidos.
- Sin el permiso: solo lectura. Errores: `validaciones` en los campos; el resto, `mensaje` de la API.
- Botones del pie de `FormPanel` directos, sin `div`. No crear ni modificar nada en `src/shared/components/**` ni `globals.css`.

## Verificación sin navegador
Igual que W-010: iniciar sesión **a través de la web** con `curl` guardando la cookie, fijar la tienda activa con `PUT /api/sesion` (`826d8c0c-0b3d-4578-88cd-d57d608156e5` = "Tienda W006 Prueba") y probar cada criterio por el proxy `http://localhost:3100/api/…` con el mismo cuerpo que arma cada formulario. Borrar el archivo de cookies al terminar; nunca copiar la contraseña ni la cookie al reporte.

## Fuera de alcance
- Suscripción (W-013). Pulido visual.

## Criterios de aceptación (con la API real, en "Tienda W006 Prueba")
- [ ] Editar el nombre de la tienda y la tasa de impuesto (por ejemplo 18 %) en "Tienda W006 Prueba" y verlos en `GET /panel/tienda`; **restaurar los valores originales enseguida** (Haiku usa esa tienda en paralelo).
- [ ] Zona horaria inválida (`Lima/Peru`) → error de la API en el campo; tasa 60 % → error.
- [ ] Activar/desactivar **solo en "Tienda W006 Dos"** (`39daf672-c629-4403-a368-b462dd9ee252`), nunca en "Tienda W006 Prueba": Haiku prueba el carrito en paralelo en la vitrina de esa tienda. Desactivar con motivo → `esta_activa: false`; luego volver a activarla y dejarla como estaba.
- [ ] Personal: agregar un correo sin cuenta → `PER-001`; agregar el correo del propio propietario → `PER-006` o `PER-003`; la lista muestra al propietario. (Agregar a alguien real requiere otra cuenta activa: si no hay, dejarlo en "No verificado".)
- [ ] `/panel/configuracion` y `/panel/personal` responden 200 con la cookie.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con la tabla de peticiones y su resultado (**sin capturas**). Datos modificados y restaurados anotados.
- [ ] **No detener la API** al terminar (Haiku trabaja en paralelo).
