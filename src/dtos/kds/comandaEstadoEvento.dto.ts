import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "../pedidos/estadoPedido"

export type ComandaEstadoEventoDto = {
  id_pedido: UUID
  estado: EstadoPedido
}
