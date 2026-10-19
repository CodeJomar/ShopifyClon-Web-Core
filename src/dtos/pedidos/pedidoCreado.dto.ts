import type { ItemPedidoDto } from "./itemPedido.dto"
import type { PedidoDto } from "./pedido.dto"

/** `POST /orders` (201, o 200 si fue un reintento con la misma Idempotency-Key). */
export type PedidoCreadoDto = PedidoDto & {
  detalles: ItemPedidoDto[]
}
