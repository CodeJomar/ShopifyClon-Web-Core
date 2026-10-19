import type { UUID } from "../core/helpers"
import type { ModificadorSeleccionPayload } from "./modificadorSeleccion.payload"

export type ItemPedidoPayload = {
  id_producto: UUID
  cantidad: number
  notas_preparacion?: string
  modificadores?: ModificadorSeleccionPayload[]
}
