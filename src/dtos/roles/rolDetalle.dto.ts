import type { UUID } from "../core/helpers"
import type { PermisoDto } from "./permiso.dto"

/** `GET /roles/:id` y respuesta de crear o actualizar. */
export type RolDetalleDto = {
  id_rol: UUID
  nombre: string
  descripcion: string | null
  total_usuarios: number
  permisos: PermisoDto[]
}
