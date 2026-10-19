import type { UUID } from "../core/helpers"
import type { EstadoItemKds, EstadoPedido } from "../pedidos"

/**
 * Respuesta de `PATCH /kds/items/:id/estado` (solo los campos que usa la web). Además del producto actualizado
 * informa el estado en que quedó el pedido, porque la API lo mueve sola: primer producto en curso → "en_preparacion";
 * todos despachados → "listo" (el pedido sale de la cola).
 */
export type ItemEstadoCambiadoDto = {
  id_pedido_detalle: UUID
  id_pedido: UUID
  nombre_producto: string
  cantidad: number
  estado_kds: EstadoItemKds
  estado_pedido: EstadoPedido
}
