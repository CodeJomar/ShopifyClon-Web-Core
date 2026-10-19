import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"

export type CrearProductoPayload = {
  id_categoria: UUID
  nombre: string
  descripcion?: string
  precio: Dinero
  disponible?: boolean
  /** Dirección https de la foto (máx. 500). En `actualizar`, una cadena vacía la quita. */
  imagen_url?: string
}
