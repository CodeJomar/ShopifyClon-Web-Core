export type TipoDescuento = "PORCENTAJE" | "MONTO_FIJO" | "ENVIO_GRATIS"

export interface CuponDto {
  id: string
  codigo: string
  tipo_descuento: TipoDescuento
  valor_descuento: number
  monto_minimo_compra?: number | null
  limite_usos_total?: number | null
  cantidad_usos_actual: number
  fecha_inicio: string
  fecha_fin?: string | null
  esta_activo: boolean
}

export interface CuponRequest {
  codigo: string
  tipo_descuento: TipoDescuento
  valor_descuento: number
  monto_minimo_compra?: number | null
  limite_usos_total?: number | null
  fecha_inicio?: string | null
  fecha_fin?: string | null
  esta_activo?: boolean
}
