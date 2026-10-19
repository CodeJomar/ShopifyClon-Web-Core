import type { DashboardResumenDto, GranularidadSerie } from "@/dtos/dashboard"
import { formatToCurrency } from "@/shared/utils/formatters"

import type { DashboardKpi } from "./schema"

/** Arma las tarjetas de KPI a partir del resumen de la API (las ventas ya son netas de devoluciones). */
export function armarKpis(data: DashboardResumenDto): DashboardKpi[] {
  const { kpis, pedidos, salon_en_vivo: salon, comparacion } = data
  return [
    {
      id: "ventas",
      titulo: "Ventas netas",
      valor: formatToCurrency(kpis.ventas_totales),
      detalle: `Devoluciones ${formatToCurrency(kpis.devoluciones)}`,
      variacion: comparacion ? comparacion.variacion_porcentual.ventas_totales : undefined,
    },
    {
      id: "pedidos",
      titulo: "Pedidos activos",
      valor: String(pedidos.activos.total),
      detalle: `${pedidos.activos.pendientes} pend. · ${pedidos.activos.en_preparacion} prep. · ${pedidos.activos.listos_sin_cobrar} listos`,
    },
    {
      id: "mesas",
      titulo: "Mesas ocupadas",
      valor: salon.porcentaje_ocupacion,
      detalle: `${salon.ocupadas} de ${salon.total_mesas} mesas`,
    },
    {
      id: "ticket",
      titulo: "Ticket promedio",
      valor: formatToCurrency(kpis.ticket_promedio),
      detalle: `${kpis.pedidos_atendidos} pedidos atendidos`,
      variacion: comparacion ? comparacion.variacion_porcentual.ticket_promedio : undefined,
    },
  ]
}

const FECHA_TRAMO = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/

/** Texto corto de un tramo de la serie ("YYYY-MM-DD HH:mm"): "14:00", "08 oct" o "sem. 06 oct". */
export function etiquetaTramo(tramo: string, granularidad: GranularidadSerie): string {
  const m = FECHA_TRAMO.exec(tramo)
  if (!m) return tramo
  if (granularidad === "hour") return `${m[4]}:${m[5]}`
  const fecha = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  const corta = fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(".", "")
  return granularidad === "week" ? `sem. ${corta}` : corta
}
