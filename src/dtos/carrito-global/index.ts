// Contrato del carrito global y del pedido con órdenes por tienda (B4 a B6 del backend, snake_case).
import type { DireccionCheckout, TarifaEnvioVitrina } from "@/dtos/checkout"

export interface TiendaDelCarrito {
  id: string
  nombre: string
  subdominio: string
}

export interface LineaCarritoDto {
  variante_id: string
  producto_id?: string
  titulo_producto: string
  titulo_variante?: string | null
  url_imagen?: string | null
  cantidad: number
  precio_unitario: number
  /** Precio de lista original (solo si hay campaña). */
  precio_comparacion?: number | null
  descuento_campana_porcentaje?: number
  campana?: string
  total_linea: number
  disponible: boolean
  requiere_envio: boolean
}

export interface TiendaCarritoDto {
  tienda: TiendaDelCarrito
  moneda: string
  lineas: LineaCarritoDto[]
  cupon?: { codigo: string } | null
  subtotal: number
  descuento_total: number
  /** null hasta cotizar con la tarifa elegida. */
  costo_envio: number | null
  impuestos_total: number
  total: number
  requiere_envio: boolean
  /** Monto ahorrado en esta tienda por la campaña vigente. */
  ahorro_campana?: number
  /** Texto, o `{codigo, mensaje}` (p. ej. CAM-002: la campaña supera al cupón y el cupón no se aplicó). */
  advertencias: (string | { codigo: string; mensaje: string })[]
}

export interface CarritoGlobalDto {
  token: string
  moneda: string
  cantidad_articulos: number
  total_general: number
  tiendas: TiendaCarritoDto[]
}

export interface TarifasDeTiendaDto {
  tienda: TiendaDelCarrito
  tarifas: TarifaEnvioVitrina[]
}

export interface EnvioElegido {
  tienda_id: string
  tarifa_envio_id: string
}

export interface CheckoutGlobalRequest {
  correo_cliente: string
  nombre_cliente: string
  telefono_cliente?: string
  direccion_envio?: DireccionCheckout
  envios: EnvioElegido[]
  pasarela: "STRIPE" | "MANUAL"
  total_esperado: number
}

export interface ItemOrdenPedido {
  titulo_producto: string
  titulo_variante?: string | null
  sku?: string | null
  precio_unitario: number
  cantidad: number
  total_linea: number
}

export interface OrdenDePedido {
  orden_id: string
  numero_orden: string
  tienda: TiendaDelCarrito
  estado: string
  estado_pago: string
  estado_preparacion: string
  total: number
  token_acceso: string
  items: ItemOrdenPedido[]
}

export type EstadoPedido =
  | "PENDIENTE"
  | "PARCIALMENTE_PAGADO"
  | "PAGADO"
  | "PARCIALMENTE_DESPACHADO"
  | "DESPACHADO"
  | "ENTREGADO"
  | "CANCELADO_PARCIAL"
  | "CANCELADO"

export interface PedidoDto {
  pedido_id: string
  numero_pedido: string
  estado: EstadoPedido
  estado_pago: "PENDIENTE" | "PARCIALMENTE_PAGADO" | "PAGADO" | "CANCELADO"
  moneda: string
  subtotal: number
  descuento_total: number
  costo_envio: number
  impuestos_total: number
  total: number
  pasarela: "STRIPE" | "MANUAL"
  token_acceso: string
  fecha_creacion: string
  fecha_expiracion_pago?: string | null
  ordenes: OrdenDePedido[]
}

export interface PagoPedidoDto {
  client_secret: string
  monto: number
  moneda: string
}
