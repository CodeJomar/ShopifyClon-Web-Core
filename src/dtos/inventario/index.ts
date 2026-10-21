// Contrato de inventario de la API (snake_case, tal cual lo envía el backend).

/** Stock de una variante (GET y PUT /panel/inventario/variantes/{id}). `vendible` = disponible − reservada (INV-001). */
export interface StockVarianteDto {
  variante_id: string
  disponible: number
  reservada: number
  vendible: number
  rastrea_inventario: boolean
  permitir_venta_sin_stock: boolean
}

/** Ajuste manual: la nueva cantidad física y un motivo obligatorio (INV-007). */
export interface AjusteStockRequest {
  nueva_cantidad: number
  motivo: string
}

/** Configuración de rastreo y venta sin stock de una variante. */
export interface ConfiguracionStockRequest {
  rastrea_inventario: boolean
  permitir_venta_sin_stock: boolean
}

/** Movimiento del historial (INV-008). `tipo` llega como texto de la API; los valores desconocidos se muestran tal cual. */
export interface MovimientoInventarioDto {
  id: string
  tipo: string
  delta_disponible: number
  delta_reservado: number
  disponible_resultante: number
  reservado_resultante: number
  orden_id?: string | null
  motivo?: string | null
  fecha: string
}
