import { z } from "zod"

import type { MetodoPago } from "@/dtos/caja"
import type { EstadoPedido } from "@/dtos/pedidos"

// Periodos del filtro: "hoy" es el día en curso; "semana" y "mes" son los últimos 7 y 30 días (rango de fechas en la API)
export const periodoDashboardSchema = z.enum(["hoy", "semana", "mes"])
export type PeriodoDashboard = z.infer<typeof periodoDashboardSchema>

export const PERIODO_LABELS: Record<PeriodoDashboard, string> = {
  hoy: "Hoy",
  semana: "Semana",
  mes: "Mes",
}

/** Días hacia atrás (incluido hoy) que cubre cada periodo. */
export const DIAS_PERIODO: Record<PeriodoDashboard, number> = { hoy: 1, semana: 7, mes: 30 }

export const ESTADO_PEDIDO_LABELS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  listo: "Listo",
  pagado: "Pagado",
  anulado: "Anulado",
}

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
}

export type TipoKpi = "ventas" | "pedidos" | "mesas" | "ticket"

export interface DashboardKpi {
  id: TipoKpi
  titulo: string
  valor: string
  detalle: string
  /** Variación porcentual frente al periodo anterior; null si no hay base de comparación; sin definir si no aplica. */
  variacion?: number | null
}

// Intervalo de refresco automático de las métricas en vivo
export const DASHBOARD_REFRESH_MS = 15_000
