import type { Dinero } from "../core/dinero"

export const GRANULARIDADES_SERIE = ["hour", "day", "week"] as const

export type GranularidadSerie = (typeof GRANULARIDADES_SERIE)[number]

/** Un tramo de la serie. `tramo` es "YYYY-MM-DD HH:mm" en hora de Lima (el inicio de la hora, día o semana). */
export type TramoVentasDto = {
  tramo: string
  /** Ventas netas (cobros menos devoluciones) del tramo. */
  ventas: Dinero
  pedidos: number
}

/** Ventas por tramo. Un día se ve por hora; hasta un mes, por día; más largo, por semana. Horas y días sin ventas vienen en cero. */
export type SerieVentasDto = {
  granularidad: GranularidadSerie
  tramos: TramoVentasDto[]
}
