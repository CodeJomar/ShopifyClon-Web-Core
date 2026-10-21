// Contrato de suscripción de la tienda de la API (suscripciones.md). JSON en snake_case.

export type CicloFacturacion = "MENSUAL" | "ANUAL"

export type EstadoSuscripcion = "PRUEBA" | "ACTIVA" | "VENCIDA" | "CANCELADA" | "SUSPENDIDA"

export interface UsoSuscripcionDto {
  productos: number
  personal: number
}

export interface LimitesSuscripcionDto {
  productos?: number | null
  personal?: number | null
}

/** `datos` de GET /panel/suscripcion (verificado en la API real). */
export interface SuscripcionPanelDto {
  estado: EstadoSuscripcion
  codigo_plan: string
  nombre_plan: string
  ciclo: CicloFacturacion
  precio_pactado: number
  moneda: string
  inicio_periodo: string
  fin_periodo: string
  fecha_fin_prueba?: string | null
  cancelar_al_finalizar_periodo: boolean
  uso: UsoSuscripcionDto
  limites: LimitesSuscripcionDto
}

/** Cuerpo de POST /panel/suscripcion/pagar. */
export interface PagarSuscripcionRequest {
  ciclo: CicloFacturacion
  token_pago: string
  codigo_plan?: string
}

/** Cuerpo de POST /panel/suscripcion/cambiar-plan. */
export interface CambiarPlanRequest {
  codigo_plan: string
  ciclo: CicloFacturacion
  token_pago: string
}

/** Cuerpo de POST /panel/suscripcion/cancelar. */
export interface CancelarSuscripcionRequest {
  motivo: string
}
