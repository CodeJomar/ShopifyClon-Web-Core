import type { UUID } from "../core/helpers"
import type { EstadoItemKds } from "../pedidos/estadoItemKds"

export type CambiarEstadoItemSocketPayload = {
  id_pedido_detalle: UUID
  estado_kds: EstadoItemKds
}
