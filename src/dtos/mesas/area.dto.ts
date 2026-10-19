/** Fila de `GET /tables/areas`: un área del local (texto libre de la mesa) con su número de mesas. */
export type AreaDto = {
  area: string
  total_mesas: number
}
