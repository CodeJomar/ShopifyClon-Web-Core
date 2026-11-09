// Contrato del checkout y de la orden pública de la vitrina (Swagger, snake_case). Los montos los calcula la API.
import type { Dinero } from "@/dtos/core/dinero"

/** Tarifa de envío activa (GET /vitrina/{sub}/tarifas-envio). */
export interface TarifaEnvioVitrina {
  id: string
  nombre: string
  descripcion?: string | null
  precio: Dinero | number
  monto_minimo_gratis?: Dinero | number | null
}

/** Dirección del checkout (límites de DireccionCheckoutRequest). */
export interface DireccionCheckout {
  nombre_contacto: string
  telefono?: string
  direccion_linea1: string
  direccion_linea2?: string
  ciudad: string
  estado_provincia: string
  codigo_postal: string
  pais: string
  /** Punto de entrega marcado en el mapa (A-004, ENV-007: obligatorio si hay envío). */
  latitud?: number
  longitud?: number
}

/** Cuerpo de POST /vitrina/{sub}/checkout. `total_esperado` es el total que la API devolvió en el carrito. */
export interface CheckoutRequest {
  correo_cliente: string
  nombre_cliente: string
  telefono_cliente?: string
  direccion_envio?: DireccionCheckout
  direccion_facturacion?: DireccionCheckout
  tarifa_envio_id?: string
  pasarela: "MANUAL"
  total_esperado: number
}

export interface ItemCheckout {
  titulo_producto: string
  titulo_variante: string
  sku?: string | null
  precio_unitario: Dinero | number
  cantidad: number
  total_linea: Dinero | number
}

/** Respuesta de POST /vitrina/{sub}/checkout (201 o 200 si es una repetición con la misma clave). */
export interface OrdenCreada {
  orden_id: string
  numero_orden: string
  estado: string
  estado_pago: string
  moneda: string
  items: ItemCheckout[]
  subtotal: Dinero | number
  descuento_total: Dinero | number
  costo_envio: Dinero | number
  impuestos_total: Dinero | number
  total: Dinero | number
  pasarela: string
  token_acceso: string
  fecha_expiracion_pago?: string | null
}

/** Línea de la orden pública (ItemOrdenVistaResponse). */
export interface ItemOrdenPublica {
  titulo_producto: string
  titulo_variante: string
  sku?: string | null
  precio_unitario: Dinero | number
  cantidad: number
  total_linea: Dinero | number
}

/** Orden vista por el comprador (GET /vitrina/{sub}/ordenes/{token}). Las direcciones son objetos libres. */
export interface OrdenPublica {
  numero_orden: string
  fecha_creacion: string
  nombre_cliente: string
  estado: string
  estado_pago: string
  estado_preparacion: string
  items: ItemOrdenPublica[]
  subtotal: Dinero | number
  descuento_total: Dinero | number
  costo_envio: Dinero | number
  impuestos_total: Dinero | number
  total: Dinero | number
  moneda: string
  direccion_envio?: Record<string, unknown> | null
  direccion_facturacion?: Record<string, unknown> | null
  fecha_expiracion_pago?: string | null
  pasarela: string
}
