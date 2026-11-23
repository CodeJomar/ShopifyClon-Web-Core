# Módulo: catálogo

## Propósito
Productos, variantes, imágenes y categorías de una tienda; y la vitrina pública que los muestra.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Categorias` | nombre, slug, descripción | slug único por tienda (no eliminados) |
| `Productos` | título, slug, descripción, proveedor, `EsDigital`, `EstaPublicado` | slug único por tienda |
| `ProductosCategorias` | producto, categoría | par único |
| `VariantesProducto` | título, SKU, código de barras, precio, precio comparación, costo, peso, `RequiereEnvio` | SKU único por tienda (D-013); precio ≥ 0 |
| `ImagenesProducto` | URL, alt, posición, principal, variante opcional | una principal por producto |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| CAT-001 | Todo producto tiene al menos una variante no eliminada: el alta exige al menos una (con SKU) y no se puede eliminar la última. | servicio |
| CAT-002 | Slug: se genera del título (minúsculas, sin tildes, guiones); si existe en la tienda se añade `-2`, `-3`… Editable; único por tienda. | servicio + índice parcial |
| CAT-003 | SKU en mayúsculas, sin espacios, único por tienda entre no eliminados. | servicio |
| CAT-004 | `PrecioComparacion`, si existe, debe ser > `Precio` (si no, no tiene sentido mostrarlo tachado). | servicio |
| CAT-005 | Producto digital (`EsDigital`) ⇒ todas sus variantes `RequiereEnvio = FALSE` y `RastreaInventario` opcional. | servicio |
| CAT-006 | Crear producto respeta `LimiteProductos` del plan (SUS-011). | servicio |
| CAT-007 | Un producto solo se puede **publicar** si tiene título, al menos una variante con precio > 0 e imagen principal (Q-009: ¿imagen obligatoria?). | servicio |
| CAT-008 | Eliminar producto/variante es lógico; sus filas en `ItemsOrden` siguen apuntando a ellos (FK RESTRICT). Eliminar un producto lo quita de carritos activos al recalcular. | servicio |
| CAT-009 | La categoría solo agrupa productos de su misma tienda; asignar una categoría de otra tienda → 404. | servicio |
| CAT-010 | Al marcar una imagen como principal se desmarca la anterior. La primera imagen subida es principal. | servicio |
| CAT-011 | Vitrina: solo productos `EstaPublicado` de tiendas operativas (TIE-004), con precio de la variante más barata, stock vendible > 0 o venta sin stock, y **nunca** `CostoUnitario`. | caso de uso de vitrina |
| CAT-012 | El costo unitario y el margen solo los ven roles con `CATALOGO_GESTIONAR`. | DTO de respuesta del panel |

## Permisos
| Acción | Permiso |
|---|---|
| CRUD producto, variante, imagen, categoría | `CATALOGO_GESTIONAR` |
| Vitrina (listar, detalle por slug, categorías) | público, por subdominio |

## Operaciones (panel bajo `X-Tienda-Id`; vitrina bajo `/vitrina/{subdominio}`)
| Operación | Entrada | Errores |
|---|---|---|
| Crear producto (con 1..n variantes e inventario inicial) | título, descripción, variantes[] | `CAT-003`, `CAT-006` |
| Editar producto / variante | campos | `CAT-002..005` |
| Publicar / despublicar | — | `CAT-007` |
| Eliminar producto / variante | — | `CAT-001` |
| Listar (panel) | búsqueda, publicado, categoría, paginación | — |
| Vitrina: listar, detalle por slug, por categoría | subdominio, filtros | 404 si tienda no operativa |

## Casos límite
- Hoy `GET /catalogo/productos` es público y sin tienda devuelve productos de **todas** las tiendas, incluidos no publicados: debe separarse en ruta de panel (autenticada) y de vitrina (pública, filtrada).

## Pruebas asociadas
| Regla | Prueba |
|---|---|
| CAT-003 | Dos tiendas usan el mismo SKU → ambas OK; misma tienda → 422 |
| CAT-011 | Vitrina no lista productos no publicados ni de tienda vencida; respuesta sin `costo_unitario` |
