import { apiRequest } from "@/lib/api/client"
import { OneQuery } from "@/dtos/core/oneQuery.dto"
import type { DashboardQuery, DashboardResumenDto } from "@/dtos/dashboard"
import { rangoUltimosDias } from "@/shared/utils/fechas"

import { DIAS_PERIODO, type PeriodoDashboard } from "../schema"

/** Sin fechas la API devuelve hoy; para semana y mes se pide el rango de los últimos N días. */
export function consultaDePeriodo(periodo: PeriodoDashboard): DashboardQuery {
  const dias = DIAS_PERIODO[periodo]
  return dias === 1 ? {} : rangoUltimosDias(dias)
}

export const getDashboardResumen = (periodo: PeriodoDashboard) =>
  apiRequest<OneQuery<DashboardResumenDto>>(OneQuery, {
    method: "GET",
    url: "/dashboard/resumen",
    params: consultaDePeriodo(periodo),
  })
