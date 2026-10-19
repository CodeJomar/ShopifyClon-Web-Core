import type { UUID } from "../core/helpers"
import type { EstadoMesa } from "../mesas/estadoMesa"

export type CambiarEstadoLimpiezaSocketPayload = {
  id_mesa: UUID
  nuevo_estado: Extract<EstadoMesa, "libre">
}
