import type { UUID } from "../core/helpers"
import type { PaginacionQuery } from "../core/paginacion.query"
import type { RangoFechasQuery } from "../core/rangoFechas.query"
import type { EstadoPedido } from "./estadoPedido"
import type { TipoPedido } from "./tipoPedido"

export type ListarPedidosQuery = PaginacionQuery &
  RangoFechasQuery & {
    estado?: EstadoPedido
    tipo_pedido?: TipoPedido
    id_mesa?: UUID
    // `busqueda` (de PaginacionQuery) busca por cliente, mesa, número de pedido (#12) o inicio del id.
  }
