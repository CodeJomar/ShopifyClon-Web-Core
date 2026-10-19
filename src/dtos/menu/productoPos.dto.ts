import type { GrupoModificadorDto } from "./grupoModificador.dto"
import type { ProductoDto } from "./producto.dto"

/** Producto dentro del catálogo del POS: ya trae sus grupos de modificadores. */
export type ProductoPosDto = ProductoDto & {
  grupos_modificadores: GrupoModificadorDto[]
}
