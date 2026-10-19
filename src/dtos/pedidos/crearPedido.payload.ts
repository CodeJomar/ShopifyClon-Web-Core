import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"
import type { ItemPedidoPayload } from "./itemPedido.payload"
import type { TipoPedido } from "./tipoPedido"

/**
 * Crea la comanda y la envía a cocina. El precio, el nombre y la disponibilidad los resuelve el servidor.
 * Envía siempre la cabecera `Idempotency-Key` (una por intento de envío) para que un doble clic no duplique el pedido.
 * Los de salón exigen `id_mesa`. El descuento exige el permiso `ORDERS:DESCONTAR`.
 */
export type CrearPedidoPayload = {
  tipo_pedido?: TipoPedido
  id_mesa?: UUID
  /** Nombre del cliente (opcional, máx. 100 caracteres): sirve para llamarlo cuando el pedido está listo. */
  cliente_nombre?: string
  descuento?: Dinero
  items: ItemPedidoPayload[]
}
