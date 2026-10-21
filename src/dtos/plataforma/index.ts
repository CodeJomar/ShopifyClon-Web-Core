// Contrato de plataforma de la API (suscripciones.md y balances-y-metricas.md). JSON en snake_case.

export interface PlanPlataformaDto {
  codigo: string
  nombre: string
  descripcion?: string | null
  precio_mensual: number
  precio_anual: number
  moneda: string
  limite_productos?: number | null
  limite_personal: number
  porcentaje_comision: number
  dias_prueba: number
  es_publico: boolean
  orden: number
}

export interface CrearPlanRequest {
  codigo: string
  nombre: string
  descripcion?: string | null
  precio_mensual: number
  precio_anual: number
  moneda: string
  limite_productos?: number | null
  limite_personal: number
  porcentaje_comision: number
  dias_prueba?: number
  es_publico?: boolean
  orden?: number
}

export interface ActualizarPlanRequest {
  nombre: string
  descripcion?: string | null
  precio_mensual: number
  precio_anual: number
  moneda: string
  limite_productos?: number | null
  limite_personal: number
  porcentaje_comision: number
  dias_prueba?: number
  es_publico?: boolean
  orden?: number
}

export interface SuscripcionPlataformaDto {
  tienda_id: string
  subdominio: string
  codigo_plan: string
  estado: string
  fin_periodo_actual: string
}

export interface ComisionTiendaDto {
  tienda_id: string
  nombre: string
  subdominio: string
  plan_vigente: string
  total_comisiones: number
  total_ventas_historico: number
}

export interface ConsultaPaginadaDto<T> {
  datos: T[]
  total: number
  pagina_actual: number
  tamano_pagina: number
  total_paginas: number
  tiene_mas_paginas: boolean
  marca_tiempo?: string
}

export interface MotivoTiendaRequest {
  motivo: string
}
