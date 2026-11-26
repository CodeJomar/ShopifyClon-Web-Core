import type { AparienciaTienda } from "@/modules/apariencia/catalogo"
// Contrato de tiendas de la API (tiendas-y-personal.md). JSON en snake_case, sin conversión.

/** Elemento de GET /planes (público). */
export interface PlanDto {
  codigo: string
  nombre: string
  descripcion: string
  precio_mensual: number
  precio_anual: number
  moneda: string
  /** null = productos ilimitados (plan Avanzado). */
  limite_productos: number | null | undefined
  /** null o ausente = sin límite de personal. */
  limite_personal: number | null | undefined
  /** Fracción: 0.02 = 2 %. */
  porcentaje_comision: number
  /** Plan sin costo ni vencimiento (B3); solo uno por persona. */
  es_gratuito?: boolean
  dias_prueba: number
}

/** Elemento de GET /cuenta/tiendas. */
export interface MiTiendaDto {
  tienda_id: string
  nombre: string
  subdominio: string
  rol: string
  esta_activa: boolean
  operativa: boolean
  ruc?: string
}

/** `datos` de POST /cuenta/tiendas (201). */
export interface TiendaCreadaDto {
  id: string
  nombre: string
  subdominio: string
  suscripcion: unknown
  operativa: boolean
}

/** `datos` de GET /panel/tienda (TiendaConfiguracionResponse, verificado en la API real). */
export interface TiendaActivaDto {
  id: string
  nombre: string
  subdominio: string
  dominio_personalizado?: string | null
  moneda: string
  correo_contacto: string
  tasa_impuesto: number
  precios_incluyen_impuesto: boolean
  zona_horaria: string
  esta_activa: boolean
  /** false = suscripción no activa: las escrituras responden SUS-017. */
  operativa: boolean
  suscripcion: { estado: string; codigo_plan: string; fin_periodo_actual: string }
  fecha_creacion: string
  /** RUC de la tienda; ausente en las anteriores a este dato. */
  ruc?: string
  /** Apariencia de la vitrina; ausente hasta que el propietario la elija. */
  apariencia?: Partial<AparienciaTienda>
}

export type TiendaConfiguracionDto = TiendaActivaDto

export interface ActualizarTiendaRequest {
  /** RUC (11 dígitos); ausente conserva el actual. Solo lo cambia el propietario. */
  ruc?: string
  nombre: string
  correo_contacto: string
  dominio_personalizado?: string | null
  moneda: string
  tasa_impuesto: number
  precios_incluyen_impuesto: boolean
  zona_horaria: string
}

export interface CambioEstadoTiendaRequest {
  motivo?: string
}
