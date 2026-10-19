import type { GrupoModificadorDto } from "./grupoModificador.dto"
import type { ProductoListadoDto } from "./productoListado.dto"

/** `GET /menu/productos/:id`: el producto con los grupos de modificadores que se le asignaron. */
export type ProductoDetalleDto = ProductoListadoDto & {
  grupos_modificadores: GrupoModificadorDto[]
}
