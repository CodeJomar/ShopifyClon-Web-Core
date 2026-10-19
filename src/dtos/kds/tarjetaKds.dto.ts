import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "../pedidos/estadoPedido"
import type { TipoPedido } from "../pedidos/tipoPedido"
import type { ItemKdsDto } from "./itemKds.dto"

/** Tarjeta de un pedido en la cola (`GET /kds/tablero`, evento `kds:nueva-comanda`). Más antiguos primero. */
export type TarjetaKdsDto = {
  id_pedido: UUID
  id_mesa: UUID | null
  mesa_numero: string | null
  /** Número legible del pedido (#1, #2…). */
  correlativo: number | null
  cliente_nombre: string | null
  tipo_pedido: TipoPedido
  /** "pendiente" o "en_preparacion" mientras está en la cola. */
  estado: EstadoPedido
  fecha_creacion: FechaIso
  minutos_transcurridos: number
  items: ItemKdsDto[]
}
