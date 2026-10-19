import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "../pedidos/estadoPedido"
import type { TipoPedido } from "../pedidos/tipoPedido"

/** Uno de los pedidos más recientes del periodo (hasta 8). */
export type PedidoRecienteDto = {
  id_pedido: UUID
  correlativo: number
  mesa_numero: string | null
  cliente_nombre: string | null
  tipo_pedido: TipoPedido
  estado: EstadoPedido
  total: Dinero
  fecha_creacion: FechaIso
  creado_por: string | null
}
