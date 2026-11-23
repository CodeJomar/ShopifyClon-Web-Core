# T-008 — Reescribir `catalogo` (panel y vitrina) con inventario inicial

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/T-008-modulo-catalogo` desde `develop` |
| Depende de | T-007 |
| Tamaño | L — puntos de control con commit en cada uno |

## Objetivo
Reemplazar `modules/catalogo` por `modulos/catalogo` según `catalogo.md`, crear la base del módulo `inventario` (solo lo necesario para el alta de variantes y la disponibilidad en vitrina) y retirar el último uso de `TenantContextHolder`.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/arquitectura-backend.md`
- `docs/negocio/modulos/catalogo.md` (**fuente de verdad**: CAT-001…012)
- `docs/negocio/modulos/inventario.md` → solo INV-001, INV-003, INV-008 y la entidad `MovimientosInventario`
- `docs/negocio/05-decisiones.md` → D-013, D-014
- `docs/orquestacion/reportes/T-002.reporte.md` → sección "Revisión (Opus)", observación sobre `TenantContextHolder`
- Imitar: `modulos/tienda/**` (panel con `@RequierePermiso`, vitrina pública, pruebas). Usar: `TiendaServicio.idOperativaPorSubdominio`, `comun/util/GeneradorSlug`, `Dinero`.

## Punto 1 — Base de `inventario`
`modulos/inventario/` con `InventarioVarianteEntidad`, `MovimientoInventarioEntidad` (tablas V1/V2 exactas), `TipoMovimiento` (enum), repositorios y `InventarioServicio` con solo:
- `@Transactional(MANDATORY) void crearInicial(UUID tiendaId, UUID varianteId, int cantidad, boolean rastrea, boolean ventaSinStock)`: crea `InventarioVariante` y, si `cantidad > 0`, un movimiento `INICIAL` (INV-008).
- `@Transactional(readOnly) Map<UUID, Disponibilidad> disponibilidad(Collection<UUID> varianteIds)` → record `Disponibilidad(int vendible, boolean rastrea, boolean ventaSinStock, boolean disponible)` con INV-001 (`vendible = Disponible − Reservado`; `disponible = !rastrea || ventaSinStock || vendible > 0`).
- `@Transactional(readOnly) Optional<Disponibilidad> de(UUID varianteId)`.
Ajustes, reservas y ventas son de T-009.

## Punto 2 — Catálogo del panel (todo con `@RequierePermiso(CATALOGO_GESTIONAR)`)
| Ruta | Notas |
|---|---|
| `GET/POST /panel/catalogo/categorias`, `PUT/DELETE /panel/catalogo/categorias/{id}` | slug CAT-002 desde el nombre (editable, `^[a-z0-9](-?[a-z0-9])*$`), eliminación lógica que también elimina sus filas de `ProductosCategorias` |
| `GET /panel/catalogo/productos?pagina=&texto=&publicado=&categoria_id=` | paginado 20; precio mínimo, número de variantes, stock vendible total, imagen principal |
| `GET /panel/catalogo/productos/{id}` | detalle con variantes (incluye `costo_unitario` e inventario), imágenes y categorías |
| `POST /panel/catalogo/productos` | `titulo`, `descripcion?`, `proveedor?`, `es_digital?`, `categoria_ids?`, `variantes[]` (1–100; al menos una, cada una con SKU obligatorio) con `titulo`, `sku`, `codigo_barras?`, `precio`, `precio_comparacion?`, `costo_unitario?`, `peso_gramos?`, `requiere_envio?`, `cantidad_inicial` (≥ 0), `rastrea_inventario?` (true), `permitir_venta_sin_stock?` (false). Nace **no publicado**. CAT-001/003/004/005/006/009 |
| `PUT /panel/catalogo/productos/{id}` | datos del producto (no variantes), slug editable con CAT-002 |
| `POST /panel/catalogo/productos/{id}/publicar` · `/despublicar` | CAT-007 (imagen principal obligatoria, Q-009) → 422 `CAT-007` con lo que falta |
| `DELETE /panel/catalogo/productos/{id}` | lógica, CAT-008 |
| `POST /panel/catalogo/productos/{id}/variantes`, `PUT/DELETE /panel/catalogo/variantes/{id}` | CAT-001 (no borrar la última), CAT-003/004; la nueva variante crea su inventario inicial |
| `PUT /panel/catalogo/productos/{id}/categorias` | `categoria_ids` reemplaza el conjunto (CAT-009) |
| `POST /panel/catalogo/productos/{id}/imagenes`, `PUT/DELETE /panel/catalogo/imagenes/{id}` | `url_imagen` `https://` ≤ 2000, `texto_alternativo?` ≤ 200, `variante_id?` (del mismo producto), `posicion?`, `es_principal?`; CAT-010 (desmarcar antes de marcar; la primera es principal; borrar la principal promueve la siguiente por posición) |

- **SKU por tienda (D-013)**: mayúsculas sin espacios; único entre variantes no eliminadas de productos no eliminados **de la misma tienda** (consulta con `JOIN`) → 422 `CAT-003`.
- **Límite del plan (CAT-006, SUS-011)**: agrega en `modulos/suscripcion` un método público que reciba solo el `tiendaId` (p. ej. `UsoPlanServicio.exigirCupoProducto(UUID tiendaId)`, reutilizando su conteo) → 422 `CAT-006` cuando productos no eliminados ≥ `LimiteProductos` (null = sin límite). `catalogo` no importa entidades de `suscripcion`.
- Recurso de otra tienda → 404 `CAT-404`.

## Punto 3 — Vitrina pública (`TiendaServicio.idOperativaPorSubdominio`; no operativa → 404 `TIE-404`)
| Ruta | Respuesta |
|---|---|
| `GET /vitrina/{sub}/categorias` | categorías con al menos un producto publicado |
| `GET /vitrina/{sub}/productos?pagina=&texto=&categoria=<slug>&orden=recientes\|precio_asc\|precio_desc` | publicados: título, slug, precio mínimo, precio comparación de esa variante, imagen principal, `disponible` |
| `GET /vitrina/{sub}/productos/{slug}` | detalle: variantes (`id`, título, precio, precio comparación, `disponible`, `requiere_envio`), imágenes por posición, categorías. **Nunca** `costo_unitario` ni cantidades exactas (CAT-011/012) |
No publicado, eliminado o de otra tienda → 404 `CAT-404`.

## Punto 4 — Limpieza
1. Borrar `modules/catalogo/**` (y el directorio `modules/` completo si queda vacío salvo `notificacion`).
2. Quitar el bloque `// TEMPORAL … catalogo (T-008)` de `SecurityConfig`.
3. Retirar `TenantContextHolder` (`comun/seguridad`) y su uso en `ContextoTiendaInterceptor`; desde ahora el interceptor **solo** valida `X-Tienda-Id` cuando la ruta exige tienda (con `@RequierePermiso` o parámetro `ContextoTienda`). Ajusta la prueba de T-002 que esperaba 404 en rutas que no exigen tienda.

## Criterios de aceptación (con pruebas)
- [ ] Crear producto con 2 variantes e inventario inicial → filas en `VariantesProducto`, `InventarioVariante` y `MovimientosInventario` (`INICIAL`); nace no publicado.
- [ ] Mismo SKU en dos tiendas → OK; en la misma tienda → 422 `CAT-003`.
- [ ] Slug repetido → `-2`; publicar sin imagen principal → 422 `CAT-007`.
- [ ] No se puede eliminar la última variante (`CAT-001`); producto digital fuerza `requiere_envio = false`.
- [ ] Plan `BASICO` con 100 productos → el 101 da 422 `CAT-006`.
- [ ] Vitrina: no lista no publicados ni de tienda no operativa; la respuesta no contiene `costo_unitario`; `disponible` respeta `ventaSinStock` y `rastrea`.
- [ ] `GESTOR_PEDIDOS` → 403 en el panel de catálogo; recurso de otra tienda → 404.
- [ ] Ninguna ruta `/catalogo/**` responde; no existen `modules/catalogo` ni `TenantContextHolder`.
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` pasa; commits sin coautor.
