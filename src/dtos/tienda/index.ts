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
  limite_productos: number | null
  limite_personal: number
  /** Fracción: 0.02 = 2 %. */
  porcentaje_comision: number
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
}

/** `datos` de POST /cuenta/tiendas (201). */
export interface TiendaCreadaDto {
  id: string
  nombre: string
  subdominio: string
  suscripcion: unknown
  operativa: boolean
}

/** `datos` de GET /panel/tienda. TODO(Q-W-006): confirmar los campos reales de la respuesta. */
export interface TiendaActivaDto {
  nombre: string
  subdominio: string
  moneda?: string
}
