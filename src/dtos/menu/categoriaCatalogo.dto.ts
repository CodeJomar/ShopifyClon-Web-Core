import type { CategoriaDto } from "./categoria.dto"
import type { ProductoPosDto } from "./productoPos.dto"

/** `GET /menu/catalogo-pos`: categorías con sus productos y modificadores, listas para el POS. */
export type CategoriaCatalogoDto = CategoriaDto & {
  productos: ProductoPosDto[]
}
