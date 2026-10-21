// Contrato de métricas de la API (MetricasResponse, verificado en la API real). JSON en snake_case.

/** Totales del rango (ResumenResponse). Importes con la moneda de la respuesta. */
export interface ResumenMetricasDto {
  ventas_historicas: number
  reembolsado: number
  comisiones: number
  saldo_por_cobrar: number
  ordenes_pagadas: number
}

/** Un día del rango (DiaResponse). */
export interface DiaMetricasDto {
  fecha: string
  ventas_brutas: number
  reembolsos: number
  ventas_netas: number
  ordenes_pagadas: number
  ticket_promedio: number
}

/** Producto más vendido del rango (TopProductoResponse). */
export interface TopProductoDto {
  variante_id: string
  titulo_producto: string
  titulo_variante?: string | null
  unidades: number
  importe: number
}

/** Respuesta de GET /panel/metricas. */
export interface MetricasDto {
  moneda: string
  zona_horaria: string
  desde: string
  hasta: string
  resumen: ResumenMetricasDto
  por_dia: DiaMetricasDto[]
  top_productos: TopProductoDto[]
  ordenes_por_preparar?: number
}
