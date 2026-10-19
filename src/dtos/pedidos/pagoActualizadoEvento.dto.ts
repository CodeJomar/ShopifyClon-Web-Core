import type { EstadoPago } from "../caja/estadoPago"
import type { UUID } from "../core/helpers"

/** Mensaje en tiempo real `pedido:pago-actualizado`. */
export type PagoActualizadoEventoDto = {
  id_pedido: UUID
  estado_pago: EstadoPago
}
