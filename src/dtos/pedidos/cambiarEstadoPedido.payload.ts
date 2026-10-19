import type { EstadoPedidoEditable } from "./estadoPedido"

/** Revertir (en_preparacion → pendiente, listo → en_preparacion) y anular exigen `motivo`. Anular exige `ORDERS:ANULAR`. */
export type CambiarEstadoPedidoPayload = {
  estado: EstadoPedidoEditable
  motivo?: string
}
