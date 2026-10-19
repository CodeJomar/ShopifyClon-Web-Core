import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"

/** Opción elegida de un modificador, tal como quedó guardada en el pedido (foto del momento de la venta). */
export type ModificadorPedidoDto = {
  id_grupo: UUID
  grupo: string
  id_opcion: UUID
  opcion: string
  price_delta: Dinero
}
