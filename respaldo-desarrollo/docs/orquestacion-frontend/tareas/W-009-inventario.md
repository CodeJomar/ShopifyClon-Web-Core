# W-009 — Inventario: stock por variante, ajuste con motivo e historial (base funcional)

| Campo | Valor |
|---|---|
| Modelo | Haiku |
| Rama | `tarea/W-009-inventario` desde `develop` (ya incluye W-008) |
| Depende de | W-008 |
| Tamaño | S–M |

## Objetivo
El comerciante ve el stock de cada variante (disponible, reservado, vendible), lo ajusta indicando un motivo, cambia si la variante rastrea inventario o se vende sin stock, y consulta el historial de movimientos. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md`
- `docs/negocio/modulos/inventario.md` (INV-001…009)
- Código a imitar: `src/modules/catalogo/` (lista de productos, detalle con variantes, `FormPanel`, acciones), `src/modules/panel/hooks/use-panel.tsx` (`puede`), marcador `src/app/panel/inventario/page.tsx`

## Contrato de la API (verificado por Opus; JSON en `snake_case`; con `X-Tienda-Id`; permiso `INVENTARIO_AJUSTAR`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Stock de una variante | `GET /panel/inventario/variantes/{varianteId}` | `{ variante_id, disponible, reservada, vendible, rastrea_inventario, permitir_venta_sin_stock }` |
| Ajustar stock | `PUT /panel/inventario/variantes/{varianteId}` | `{ nueva_cantidad (entero ≥ 0), motivo (5–255 caracteres) }` → el inventario actualizado |
| Configuración | `PUT /panel/inventario/variantes/{varianteId}/configuracion` | `{ rastrea_inventario, permitir_venta_sin_stock }` |
| Historial | `GET /panel/inventario/variantes/{varianteId}/movimientos?pagina=0&desde=&hasta=` (ISO 8601 con hora) | `Paginado<{ id, tipo, delta_disponible, delta_reservado, disponible_resultante, reservado_resultante, orden_id?, motivo?, fecha }>` |

La API **no** tiene un listado general de stock: la pantalla se arma con el listado de productos (`GET /panel/catalogo/productos`, W-008) y el detalle de cada producto (`GET /panel/catalogo/productos/{id}`, que trae sus variantes y el bloque de inventario). Confirmar en el código de W-008 cómo viene ese bloque.

## Pantallas
| Ruta | Muestra / permite |
|---|---|
| `/panel/inventario` | Buscador por producto (reusar las acciones de W-008) y lista de productos; al elegir uno se ven sus variantes con título, SKU, disponible, reservado y vendible, y las insignias "Sin rastreo" / "Vende sin stock" cuando aplique. Paginación como en productos |
| Ajuste (en `FormPanel`) | Cantidad nueva (entero ≥ 0) y motivo (obligatorio, 5–255). Muestra el stock actual. Al guardar, refresca la fila y toast |
| Configuración (en el mismo panel o en otro) | Interruptores "Rastrear inventario" y "Vender sin stock" |
| Historial (en `FormPanel` o subpágina `/panel/inventario/variantes/[id]`) | Movimientos paginados: fecha (`formatearFecha`), tipo en español (mapear los valores de `tipo` que devuelva la API; los desconocidos se muestran tal cual), cambio (+/−), resultado, motivo o enlace a la orden si hay `orden_id` |

- Sin `INVENTARIO_AJUSTAR`: solo lectura.
- Errores: `validaciones` en los campos; el resto, `mensaje` de la API (incluido `SUS-017`, que ya maneja el cliente).
- Botones del pie de `FormPanel` directos, sin `div`. No crear ni modificar nada en `src/shared/components/**` ni `globals.css`.

## Fuera de alcance
- Reservas y ventas (las hace el checkout y las órdenes). Pulido visual.

## Criterios de aceptación (con la API real, en "Tienda W006 Prueba")
- [ ] Ver el stock de las variantes de un producto de W-008.
- [ ] Ajustar una variante (por ejemplo de 4 a 10 con el motivo "Conteo físico") y ver el cambio, y el movimiento nuevo en el historial.
- [ ] Motivo de menos de 5 caracteres → error en el campo; cantidad negativa → error.
- [ ] Cambiar "Vender sin stock" y ver el cambio tras recargar.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo probado y su resultado (**sin capturas**). Ajustes de prueba anotados.
- [ ] **No detener la API** al terminar (hay otro agente en paralelo).
