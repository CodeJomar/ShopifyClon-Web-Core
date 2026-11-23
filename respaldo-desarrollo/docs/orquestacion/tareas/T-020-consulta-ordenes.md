# T-020 — Consulta de órdenes: panel, "mis órdenes" y estado público

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-020-consulta-ordenes` desde `develop` |
| Depende de | T-015 |
| Tamaño | S/M |

## Objetivo
Leer órdenes: listado y detalle en el panel (ORD-011), historial del comprador (ORD-012) y página pública de estado por token (ORD-010). Solo lectura.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/ordenes.md` → ORD-010, 011, 012 y permisos
- Código: `modulos/orden/**`. **Para no chocar con T-016/017/018 en paralelo, no modifiques `OrdenServicio` ni `OrdenRepositorio`**: crea `OrdenConsultaServicio`, `OrdenConsultaRepositorio` (otra interfaz Spring Data sobre `OrdenEntidad`), `OrdenConsultaControlador` y sus DTOs.

## Alcance
| Ruta | Permiso | Respuesta |
|---|---|---|
| `GET /panel/ordenes?pagina=&estado=&estado_pago=&estado_preparacion=&desde=&hasta=&texto=` | `ORDENES_VER` | paginado 20, más recientes primero: id, número, fecha, cliente (nombre, correo), total, moneda, los tres estados. `texto` busca en número, correo y nombre (contiene, sin distinguir mayúsculas, con `%` y `_` escapados). Filtros de estado inválidos → 400 `VAL-003` |
| `GET /panel/ordenes/{ordenId}` | `ORDENES_VER` | detalle completo: cliente, direcciones, ítems, totales, cupón, tarifa, impuesto, estados, fechas (creación, expiración, cancelación, cierre), `comision_plataforma` (dato interno para el comerciante). Otra tienda → 404 `ORD-404` |
| `GET /cuenta/ordenes?pagina=&tienda_id=` | sesión | órdenes del usuario (`UsuarioId`) de todas sus compras, con nombre y subdominio de la tienda (consulta nativa de solo lectura); sin comisión |
| `GET /cuenta/ordenes/{ordenId}` | sesión | detalle si es del usuario; si no → 404 `ORD-404` |
| `GET /vitrina/{subdominio}/ordenes/{tokenAcceso}` | público | estado de la orden para el comprador invitado: número, fecha, estados, ítems, totales, direcciones, `fecha_expiracion_pago` y pasarela. Sin comisión, sin datos internos. Token o tienda incorrectos → 404 `ORD-404` |

## Criterios de aceptación (con pruebas; órdenes creadas por el checkout real)
- [ ] El panel lista solo órdenes de su tienda; los filtros de estado, fechas y texto funcionan; `GESTOR_CATALOGO` → 403.
- [ ] El comprador registrado ve sus órdenes de dos tiendas distintas y no las de otro usuario.
- [ ] La página por token muestra la orden y no expone `comision_plataforma`; token ajeno → 404.
- [ ] Ninguna consulta modifica datos; `OrdenServicio` y `OrdenRepositorio` sin cambios (`git diff develop -- …` vacío para esos dos archivos).
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
