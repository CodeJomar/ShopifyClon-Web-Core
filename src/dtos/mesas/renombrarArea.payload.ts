/** Renombra un área en todas sus mesas a la vez (`PATCH /tables/areas`). */
export type RenombrarAreaPayload = {
  actual: string
  nuevo: string
}

export type RenombrarAreaResultadoDto = {
  area: string
  mesas_actualizadas: number
}
