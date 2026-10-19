import type { EntidadAuditada } from "../core/entidadAuditada"
import type { UUID } from "../core/helpers"
import type { EstadoMesa } from "./estadoMesa"

export type MesaDto = EntidadAuditada & {
  id_mesa: UUID
  /** Identificador visible ("1", "T-4"). Único entre las mesas activas. */
  numero: string
  /** Área de atención ("Salón", "Terraza"); texto libre que administra el propietario. */
  area: string | null
  capacidad: number
  estado: EstadoMesa
}
