import type { UUID } from "../core/helpers"
import type { EstadoItemKds } from "../pedidos/estadoItemKds"
import type { EstadoPedido } from "../pedidos/estadoPedido"

export type ItemActualizadoEventoDto = {
  id_pedido: UUID
  id_pedido_detalle: UUID
  estado_kds: EstadoItemKds
  completado: boolean
  estado_pedido: EstadoPedido
}
