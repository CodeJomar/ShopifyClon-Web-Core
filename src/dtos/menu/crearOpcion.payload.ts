import type { Dinero } from "../core/dinero"

export type CrearOpcionPayload = {
  nombre: string
  price_delta?: Dinero
  disponible?: boolean
  orden_visual?: number
}
