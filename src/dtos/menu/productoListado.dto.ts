import type { ProductoDto } from "./producto.dto"

/** Fila de `GET /menu/productos` (paginada): incluye el nombre de su categoría. */
export type ProductoListadoDto = ProductoDto & {
  categoria_nombre: string
}
