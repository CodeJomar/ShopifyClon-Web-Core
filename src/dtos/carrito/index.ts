// Contrato del carrito de la API (snake_case). Los montos los calcula la API: la web solo los muestra.
import type { Dinero } from "@/dtos/core/dinero"

export interface LineaCarrito {
  variante_id: string
  producto_id: string
  titulo_producto: string
  titulo_variante: string
  url_imagen?: string | null
  precio_unitario: Dinero | number
  cantidad: number
  total_linea: Dinero | number
  disponible: boolean
  requiere_envio: boolean
}

export interface CuponCarrito {
  codigo: string
  descuento: Dinero | number
}

/** Advertencia de la API (CAR-004 stock, CAR-006 variante no disponible). No es un error: se muestra en el carrito. */
export interface AdvertenciaCarrito {
  codigo: string
  mensaje: string
  variante_id?: string | null
}

export interface Carrito {
  token: string
  estado: string
  moneda: string
  items: LineaCarrito[]
  cupon?: CuponCarrito | null
  subtotal: Dinero | number
  descuento_total: Dinero | number
  impuestos_total: Dinero | number
  /** Envío de la tarifa elegida (solo con `tarifa_envio_id`): la API lo incluye en `total_estimado`. */
  costo_envio?: Dinero | number | null
  total_estimado: Dinero | number
  requiere_envio: boolean
  advertencias: AdvertenciaCarrito[]
}
