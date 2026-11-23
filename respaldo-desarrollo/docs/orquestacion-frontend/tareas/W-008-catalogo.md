# W-008 — Catálogo: categorías, productos, variantes, imágenes y publicar (base funcional)

| Campo | Valor |
|---|---|
| Modelo | Haiku (base mínima funcional; el rediseño visual será W-008-D con Sonnet) |
| Rama | `tarea/W-008-catalogo` desde `develop` |
| Depende de | W-007-C1 (mergeada) |
| Tamaño | L |

## Objetivo
El comerciante crea y organiza su catálogo: categorías, productos con sus variantes (precio, SKU, stock inicial), imágenes **por URL**, categorías del producto, y lo publica o despublica. Todo con datos reales de la API, sus estados y sus errores. **No se busca pulido visual**: usar los componentes existentes y la guía; el diseño fino lo hará Sonnet después.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/diseno-web.md` (§2, §4, §5)
- `docs/negocio/modulos/catalogo.md` (CAT-001…012) y `docs/negocio/modulos/suscripciones.md` (SUS-011 límite de productos, SUS-017)
- Código a imitar: `src/modules/cuenta/` (lista en islas + `FormPanel` + confirmación global), `src/modules/tienda/`, `src/modules/panel/hooks/use-panel.tsx` (`puede`), `src/shared/constants/navegacion.ts`, marcadores `src/app/panel/{productos,categorias}/page.tsx`

## Contrato de la API (verificado por Opus; JSON en `snake_case`; todas con `X-Tienda-Id`, que pone el proxy)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Categorías | `GET /panel/catalogo/categorias` · `POST` · `PUT /{id}` · `DELETE /{id}` | `{ nombre, identificador_url?, descripcion? }` |
| Listar productos | `GET /panel/catalogo/productos?pagina=0&texto=&publicado=&categoria_id=` | `Paginado<{ id, titulo, identificador_url, esta_publicado, precio_minimo, numero_variantes, imagen_principal? }>` (página desde 0) |
| Detalle | `GET /panel/catalogo/productos/{id}` | `{ id, titulo, identificador_url, descripcion?, proveedor?, es_digital, esta_publicado, categorias: [{ id, nombre, identificador_url }], variantes: [{ id, titulo, sku, codigo_barras?, precio, precio_comparacion?, costo_unitario?, peso_gramos?, requiere_envio, inventario: { disponible, reservada, rastrea_inventario, permitir_venta_sin_stock } }], imagenes: [{ id, url_imagen, texto_alternativo?, variante_id?, posicion, es_principal }] }` (confirmar en Swagger dónde va el bloque de inventario de la variante) |
| Crear producto | `POST /panel/catalogo/productos` | `{ titulo, identificador_url?, descripcion?, proveedor?, es_digital?, categoria_ids?, variantes: [VarianteNueva] }` — **de 1 a 100 variantes** · nace **no publicado** |
| Editar datos | `PUT /panel/catalogo/productos/{id}` | `{ titulo, identificador_url?, descripcion?, proveedor?, es_digital? }` |
| Categorías del producto | `PUT /panel/catalogo/productos/{id}/categorias` | `{ categoria_ids: [] }` |
| Publicar / despublicar | `POST /panel/catalogo/productos/{id}/publicar` · `/despublicar` | — · CAT-007: exige título, una variante con precio > 0 e imagen principal |
| Eliminar producto | `DELETE /panel/catalogo/productos/{id}` | lógico |
| Agregar variante | `POST /panel/catalogo/productos/{productoId}/variantes` | VarianteNueva: `{ titulo, sku, codigo_barras?, precio, precio_comparacion?, costo_unitario?, peso_gramos?, requiere_envio?, cantidad_inicial?, rastrea_inventario?, permitir_venta_sin_stock? }` |
| Editar variante | `PUT /panel/catalogo/variantes/{id}` | `{ titulo, sku, codigo_barras?, precio, precio_comparacion?, costo_unitario?, peso_gramos?, requiere_envio? }` (el stock se ajusta en W-009, no aquí) |
| Eliminar variante | `DELETE /panel/catalogo/variantes/{id}` | CAT-001: no se puede eliminar la última |
| Agregar imagen | `POST /panel/catalogo/productos/{productoId}/imagenes` | `{ url_imagen (https://…, ≤ 2000), texto_alternativo? (≤ 200), variante_id?, posicion? (≥ 1), es_principal? }` · la primera es principal (CAT-010) |
| Editar / quitar imagen | `PUT /panel/catalogo/imagenes/{id}` · `DELETE /panel/catalogo/imagenes/{id}` | marcar principal desmarca la anterior |

Reglas que la UI refleja (la API decide): slug generado del título si se deja vacío (CAT-002); SKU en mayúsculas sin espacios y único (CAT-003: normalizar mientras se escribe); `precio_comparacion` > `precio` (CAT-004); producto digital ⇒ variantes sin envío (CAT-005: al marcar digital, ocultar/desactivar "requiere envío"); límite de productos del plan (SUS-011 → mostrar el `mensaje`); escrituras con la suscripción no activa → `SUS-017` (ya lo maneja el cliente). `costo_unitario` solo lo ven roles con `CATALOGO_GESTIONAR` (CAT-012).

## Pantallas
| Ruta | Muestra / permite |
|---|---|
| `/panel/categorias` | Lista en islas (nombre, slug, descripción); crear y editar en `FormPanel`; eliminar con confirmación. Vacío: "Aún no tienes categorías" + "Crear categoría" |
| `/panel/productos` | Barra de filtros (buscar por texto, estado: Todos/Publicados/Borradores, categoría); lista o tabla con miniatura (`imagen_principal` o ícono), título, insignia de estado (`marca` "Activo en tienda" / `contorno` "Borrador", §4.3), "desde {precio_minimo}" con `formatearDinero` y la moneda de la tienda, número de variantes; `BarraPaginacion`; botón "Agregar producto". Vacío con y sin filtros |
| `/panel/productos/nuevo` | Formulario: datos (título, slug opcional, descripción, proveedor, digital) + **la primera variante** (título "Predeterminada" por defecto, SKU, precio, precio de comparación, costo, peso, requiere envío, cantidad inicial, rastrea inventario, vender sin stock) + categorías (casillas). Al crear → `/panel/productos/{id}` con toast |
| `/panel/productos/[id]` | Islas: **Datos** (editar y guardar) · **Variantes** (lista; agregar y editar en `FormPanel`; eliminar con confirmación; mostrar disponible/reservado solo como lectura) · **Imágenes** (pegar URL `https` + texto alternativo → agregar; lista con miniatura, "Principal", marcar como principal, quitar) · **Categorías** (casillas + guardar) · **Estado** (insignia + "Publicar"/"Despublicar"; si `CAT-007`, mostrar el `mensaje` de la API) · "Eliminar producto" con confirmación |

- Sin `CATALOGO_GESTIONAR`: solo lectura (sin botones de escribir); la API igual devuelve 403.
- La opción "subir archivo" de imágenes **no** se hace (depende de A-001, bloqueado): dejar `TODO(A-001)` donde iría.
- Formularios con `react-hook-form` + `zod` en `modules/catalogo/schema.ts`; tipos en `src/dtos/catalogo/`; acciones en `modules/catalogo/actions/`. Montos con `formatearDinero` y la moneda de la tienda activa (`usePanel().tienda.moneda`).
- Errores: `validaciones` en cada campo (incluidos los de variantes); el resto, `mensaje` en `Alert`/toast.
- Regla de formularios: dentro de un mismo formulario, todos los campos con ícono de referencia o ninguno. Botones del pie de `FormPanel` pasados directamente (sin `div`). Límites de los campos: leerlos en los DTO de la API o en Swagger antes de escribirlos.

## Componentes
Solo componentes existentes. **No** crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Si algo hace falta (por ejemplo, un selector múltiple), se resuelve con lo que hay (casillas) y se anota en el reporte para el rediseño.

## Estados obligatorios por pantalla
Cargando (esqueletos) · vacío · error (mensaje de la API) · sin permiso (403) · éxito (toast).

## Fuera de alcance
- Ajustes de stock e historial (W-009). Subida de archivos (A-001). Pulido visual (W-008-D).

## Criterios de aceptación (con la API real, en "Tienda W006 Prueba")
- [ ] Crear 2 categorías, editar una, eliminar otra.
- [ ] Crear un producto con su primera variante y una categoría; aparece en la lista como "Borrador".
- [ ] Intentar publicarlo sin imagen → mensaje de `CAT-007`. Agregar una imagen por URL https (por ejemplo una de `https://picsum.photos/…`), publicarlo → "Activo en tienda". Despublicar.
- [ ] Agregar una segunda variante, editarla, intentar eliminar la última → `CAT-001`.
- [ ] SKU repetido → error en el campo (`CAT-003`); `precio_comparacion` ≤ `precio` → error (`CAT-004`).
- [ ] Filtros de la lista (texto, estado, categoría) y paginación sin errores.
- [ ] Capturas de cada pantalla a 375 y 1280 px en claro y oscuro, y de cada error anterior.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Datos de prueba anotados en el reporte (productos y categorías creados). No borrar nada directamente en la base de datos.
- [ ] Al terminar: `docker compose stop api-core`.
