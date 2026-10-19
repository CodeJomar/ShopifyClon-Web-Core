import type { UUID } from "../core/helpers"

/** Sin filtros: hoy (hora de Lima). Con fechas (las dos): rango de hasta 366 días. Con `id_turno_caja`: todo ese turno. */
export type DashboardQuery = {
  fecha_inicio?: string
  fecha_fin?: string
  id_turno_caja?: UUID
}
