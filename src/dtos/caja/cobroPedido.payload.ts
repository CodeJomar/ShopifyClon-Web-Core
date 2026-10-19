import type { UUID } from "../core/helpers"
import type { LineaPagoPayload } from "./lineaPago.payload"

/**
 * Cobro de un pedido. Varias líneas = pago mixto; la suma puede ser menor al saldo (cada comensal paga lo suyo).
 * Exige la cabecera `Idempotency-Key`.
 */
export type CobroPedidoPayload = {
  id_pedido: UUID
  pagos: LineaPagoPayload[]
  notas?: string
  id_turno_caja?: UUID
}
