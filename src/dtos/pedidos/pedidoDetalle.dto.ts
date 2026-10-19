import type { AutoriaPedidoDto } from "./autoriaPedido.dto"
import type { ItemPedidoDto } from "./itemPedido.dto"
import type { PedidoDto } from "./pedido.dto"
import type { ResumenPagoDto } from "./resumenPago.dto"

/** `GET /orders/:id`. */
export type PedidoDetalleDto = PedidoDto &
  ResumenPagoDto &
  AutoriaPedidoDto & {
    detalles: ItemPedidoDto[]
  }
