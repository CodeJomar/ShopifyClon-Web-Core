import type { Dinero } from "../core/dinero"
import type { FechaHoraLocal } from "../core/fechaHoraLocal"

/** Variación respecto al periodo anterior de igual duración. Cada porcentaje es null si el anterior no tuvo ventas. */
export type ComparacionPeriodoDto = {
  periodo_anterior: { inicio: FechaHoraLocal; fin: FechaHoraLocal }
  ventas_totales: Dinero
  pedidos_atendidos: number
  ticket_promedio: Dinero
  variacion_porcentual: {
    ventas_totales: number | null
    pedidos_atendidos: number | null
    ticket_promedio: number | null
  }
}
