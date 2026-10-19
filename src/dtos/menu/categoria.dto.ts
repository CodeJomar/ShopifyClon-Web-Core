import type { EntidadAuditada } from "../core/entidadAuditada"
import type { UUID } from "../core/helpers"

export type CategoriaDto = EntidadAuditada & {
  id_categoria: UUID
  nombre: string
  descripcion: string | null
  orden_visual: number
}
