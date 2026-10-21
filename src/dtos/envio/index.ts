export interface TarifaEnvioDto {
  id: string
  nombre: string
  descripcion?: string | null
  precio: number
  monto_minimo_gratis?: number | null
  esta_activa: boolean
  orden: number
}

export interface TarifaEnvioRequest {
  nombre: string
  descripcion?: string | null
  precio: number
  monto_minimo_gratis?: number | null
  esta_activa?: boolean
  orden?: number
}
