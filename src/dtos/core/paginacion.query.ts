/** Parámetros de consulta de las listas paginadas (límite máximo 100). */
export type PaginacionQuery = {
  pagina?: number
  limite?: number
  busqueda?: string
  ordenar_por?: string
  orden?: "asc" | "desc"
}
