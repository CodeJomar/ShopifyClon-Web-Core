// Contrato de órdenes del panel (Swagger, snake_case). Los montos y los saldos los calcula la API.
import type { Dinero } from "@/dtos/core/dinero"

export type EstadoOrden = "ABIERTA" | "CERRADA" | "CANCELADA"
export type EstadoPago = "PENDIENTE" | "PAGADO" | "PARCIALMENTE_REEMBOLSADO" | "REEMBOLSADO" | "ANULADO"
export type EstadoPreparacion = "NO_PREPARADO" | "PREPARADO" | "ENTREGADO"
export type EstadoEnvio = "CREADO" | "EN_TRANSITO" | "ENTREGADO" | "DEVUELTO"

/** Elemento de GET /panel/ordenes (OrdenListaResponse). */
export interface OrdenLista {
  id: string
  numero_orden: string
  fecha_creacion: string
  nombre_cliente: string
  correo_cliente: string
  total: Dinero | number
  moneda: string
  estado: EstadoOrden
  estado_pago: EstadoPago
  estado_preparacion: EstadoPreparacion
}

export interface ItemOrdenPanel {
  titulo_producto: string
  titulo_variante: string
  sku?: string | null
  precio_unitario: Dinero | number
  cantidad: number
  total_linea: Dinero | number
}

/** GET /panel/ordenes/{id} (OrdenDetallePanelResponse). Las direcciones son objetos libres. */
export interface OrdenDetallePanel {
  id: string
  numero_orden: string
  fecha_creacion: string
  nombre_cliente: string
  correo_cliente: string
  telefono_cliente?: string | null
  direccion_envio?: Record<string, unknown> | null
  direccion_facturacion?: Record<string, unknown> | null
  items: ItemOrdenPanel[]
  subtotal: Dinero | number
  descuento_total: Dinero | number
  costo_envio: Dinero | number
  impuestos_total: Dinero | number
  total: Dinero | number
  moneda: string
  codigo_cupon?: string | null
  nombre_tarifa_envio?: string | null
  pasarela: string
  estado: EstadoOrden
  estado_pago: EstadoPago
  estado_preparacion: EstadoPreparacion
  fecha_expiracion_pago?: string | null
  fecha_cancelacion?: string | null
  motivo_cancelacion?: string | null
  fecha_cierre?: string | null
}

/** Transacción de la orden (PagoResponse). */
export interface PagoOrden {
  id: string
  tipo: "CARGO" | "REEMBOLSO"
  pasarela: string
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO"
  monto: Dinero | number
  moneda: string
  referencia?: string | null
  motivo?: string | null
  pago_origen_id?: string | null
  fecha_creacion: string
}

/** Envío de la orden (EnvioResponse). */
export interface EnvioOrden {
  id: string
  orden_id: string
  empresa_transporte?: string | null
  numero_guia?: string | null
  url_seguimiento?: string | null
  estado: EstadoEnvio
  fecha_despacho?: string | null
  fecha_entrega_estimada?: string | null
  fecha_entrega_real?: string | null
}

export type MotivoCancelacion = "CLIENTE" | "FRAUDE" | "SIN_STOCK" | "OTRO"
