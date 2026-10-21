import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { MetricasDto } from "@/dtos/metricas"

// Métricas de la tienda activa (permiso METRICAS_VER). Rango en fechas calendario de Lima: AAAA-MM-DD.
export const metricasAction = (desde: string, hasta: string) =>
  resultado(peticionApi<MetricasDto>({ method: "GET", url: "/panel/metricas", params: { desde, hasta } }))
