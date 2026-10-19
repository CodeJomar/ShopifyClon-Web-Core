import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "./estadoPedido"
import type { TipoPedido } from "./tipoPedido"

/** Cabecera del pedido (respuesta de cambiar estado). */
export type PedidoDto = {
  id_pedido: UUID
  id_mesa: UUID | null
  /** Número de la mesa al momento del pedido (se conserva aunque luego se renombre). */
  mesa_numero: string | null
  id_turno_caja: UUID
  /** Número legible del pedido (#1, #2…), único y creciente. */
  correlativo: number
  cliente_nombre: string | null
  tipo_pedido: TipoPedido
  estado: EstadoPedido
  subtotal: Dinero
  descuento: Dinero
  total_calculado: Dinero
  fecha_creacion: FechaIso
  fecha_edicion: FechaIso
}
