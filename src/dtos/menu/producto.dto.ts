import type { Dinero } from "../core/dinero"
import type { EntidadAuditada } from "../core/entidadAuditada"
import type { UUID } from "../core/helpers"

export type ProductoDto = EntidadAuditada & {
  id_producto: UUID
  id_categoria: UUID
  nombre: string
  descripcion: string | null
  /** Precio base (sin modificadores). */
  precio: Dinero
  disponible: boolean
  /** Dirección https de la foto; null si no tiene. */
  imagen_url: string | null
}
