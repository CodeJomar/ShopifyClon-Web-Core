import type { UUID } from "../core/helpers"

/** Reemplaza los grupos asignados a un producto. */
export type AsignarGruposPayload = {
  grupos: Array<{ id_grupo: UUID; orden_visual?: number }>
}
