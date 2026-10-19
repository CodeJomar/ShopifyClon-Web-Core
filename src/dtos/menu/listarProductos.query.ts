import type { UUID } from "../core/helpers"
import type { PaginacionQuery } from "../core/paginacion.query"

export type ListarProductosQuery = PaginacionQuery & {
  id_categoria?: UUID
  solo_disponibles?: boolean
}
