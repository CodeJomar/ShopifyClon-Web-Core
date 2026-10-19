import type { PaginacionQuery } from "../core/paginacion.query"

export type ListarTurnosQuery = Pick<PaginacionQuery, "pagina" | "limite">
