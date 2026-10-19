import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "../pedidos/estadoPedido"
import type { MesaDto } from "./mesa.dto"

/** Fila de `GET /tables`: la mesa con su pedido en curso, si lo tiene. */
export type MesaConPedidoDto = MesaDto & {
  pedidos_activos: number
  pedido_activo: {
    id_pedido: UUID
    estado: EstadoPedido
    total: Dinero
    fecha_apertura: FechaIso
  } | null
}
