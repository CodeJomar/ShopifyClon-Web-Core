# W-005 — Cuenta: perfil, contraseña, direcciones y mis órdenes

| Campo | Valor |
|---|---|
| Modelo | Haiku |
| Rama | `tarea/W-005-cuenta` desde `develop` **con W-006 mergeada** (ambas tocan `src/app/cuenta/` y `modules/cuenta/`) |
| Depende de | W-004, W-006 (mergeadas) |
| Tamaño | M (CRUD repetitivo) |

## Objetivo
La persona con sesión ve y edita su perfil, cambia su contraseña, administra sus direcciones de envío y consulta las órdenes que hizo como compradora. Reemplaza el marcador `/cuenta` de W-004.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/diseno-web.md` (§2, §4)
- `docs/negocio/modulos/identidad.md` (USR-002, USR-008, USR-010, USR-011)
- Código a imitar: `src/modules/auth/` y `src/modules/tienda/` (vistas, `schema.ts`, acciones con `peticionApi` + `resultado`, manejo de `validaciones`), `src/modules/cuenta/`, `src/shared/hooks/useEntity*.ts`

## Contrato de la API (verificado por Opus; JSON en `snake_case`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Ver perfil | `GET /cuenta/perfil` | `{ id, correo_electronico, nombres, apellidos, telefono?, es_administrador_plataforma, fecha_creacion }` |
| Editar perfil | `PUT /cuenta/perfil` | `{ nombres, apellidos, telefono? }` (el correo no se edita) |
| Cambiar contraseña | `PUT /cuenta/contrasena` | `{ contrasena_actual, contrasena_nueva }` · 422 `USR-010` (actual incorrecta o nueva igual) |
| Listar direcciones | `GET /cuenta/direcciones` | `[{ id, nombre_contacto, telefono?, direccion_linea1, direccion_linea2?, ciudad, estado_provincia, codigo_postal, pais, es_principal, fecha_creacion }]` |
| Crear / editar | `POST /cuenta/direcciones` · `PUT /cuenta/direcciones/{id}` | `{ nombre_contacto, telefono?, direccion_linea1, direccion_linea2?, ciudad, estado_provincia, codigo_postal, pais, es_principal? }` · 422 `USR-011` (máximo 20) |
| Eliminar | `DELETE /cuenta/direcciones/{id}` | — |
| Marcar principal | `POST /cuenta/direcciones/{id}/principal` | — |
| Mis órdenes | `GET /cuenta/ordenes?pagina=0&tienda_id=` | `Paginado<{ id, numero_orden, fecha_creacion, tienda_id, tienda_nombre, tienda_subdominio, total, moneda, estado, estado_pago, estado_preparacion }>` (la página empieza en 0) |
| Detalle de orden | `GET /cuenta/ordenes/{ordenId}` | ver esquema `OrdenPublicaResponse` en Swagger |

Límites de los campos: nombre de contacto ≤ 150; teléfono ≤ 30; líneas de dirección ≤ 255; ciudad y estado/provincia ≤ 100; código postal ≤ 20. Revisar en Swagger el formato de `pais` y usar `PE` por defecto.

## Pantallas
| Ruta | Muestra / permite |
|---|---|
| `/cuenta` | Isla "Mi perfil" (nombres, apellidos, teléfono editables; correo de solo lectura con copiar) · isla "Seguridad" (cambiar contraseña: actual, nueva, confirmar) · accesos a "Mis direcciones", "Mis órdenes" y "Mis tiendas" (W-006) · "Cerrar sesión" |
| `/cuenta/direcciones` | Lista en islas; la principal con insignia `marca` "Principal". Crear y editar en el **panel lateral** (`Sheet`, regla 7 de la arquitectura). Eliminar con la **confirmación global**. "Marcar como principal". Vacío: `EstadoVacio` "Aún no tienes direcciones" con acción "Agregar dirección" |
| `/cuenta/ordenes` | Tabla (escritorio) / lista (móvil) con número, tienda, fecha (`formatearFecha`), total (`formatearDinero` con la moneda de la orden) e insignias de pago y preparación con la tabla de tonos de `docs/diseno-web.md` §4.3. `BarraPaginacion`. Vacío: "Aún no tienes compras" |
| `/cuenta/ordenes/[id]` | Detalle de la orden: líneas, totales, dirección y estados |

- Errores: `validaciones` en cada campo, el resto en toast o `Alert` con el `mensaje` de la API.
- Formularios con `react-hook-form` + `zod` en `modules/cuenta/schema.ts`; tipos en `src/dtos/cuenta/`.
- Campos con la regla de íconos de §4.2 (`User`, `Phone`, `Mail`, `Lock`, `MapPin`…). Si un formulario queda sobre el lienzo y no en una isla, su contenedor fija `[--campo-exterior:var(--background)]`.

## Componentes
Solo componentes base existentes (`Card`, `FloatingInput`, `FloatingSelect`, `Button`, `Badge` con `tono`, `Sheet`, confirmación global, `EstadoVacio`, `BarraPaginacion`, `Table`, toast, `Alert`). **No** crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Si falta algo, se anota en el reporte: el responsable revisa el diseño antes.

## Estados obligatorios por pantalla
Cargando · vacío · error (mensaje de la API) · éxito (toast).

## Fuera de alcance
- Tiendas (W-006). Panel (W-007+).

## Criterios de aceptación (con la API real)
- [ ] Editar perfil y ver el cambio tras recargar.
- [ ] Cambiar contraseña: con la actual incorrecta muestra `USR-010`; con la correcta, éxito. **Volver a dejar la contraseña de prueba original** al terminar.
- [ ] Direcciones: crear dos, marcar la segunda como principal (la primera pierde la insignia), editar una, eliminar una con confirmación.
- [ ] `/cuenta/ordenes` muestra el estado vacío (o la lista, si la cuenta tiene compras) sin errores.
- [ ] Capturas de cada pantalla a 375 y 1280 px en claro y oscuro, el `Sheet` de dirección abierto con un error de campo y la confirmación de eliminar.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Datos de prueba: anotar las direcciones creadas. No borrar nada de la base de datos directamente.
- [ ] Al terminar: `docker compose stop api-core`.
