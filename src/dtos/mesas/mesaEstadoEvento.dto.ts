import type { UUID } from "../core/helpers"
import type { EstadoMesa } from "./estadoMesa"

/** Mensaje en tiempo real `mesa:estado-actualizado`. */
export type MesaEstadoEventoDto = {
  id_mesa: UUID
  estado: EstadoMesa
}
