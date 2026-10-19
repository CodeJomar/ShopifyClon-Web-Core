import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"
import type { EstadoPago } from "./estadoPago"
import type { TransaccionCajaDto } from "./transaccionCaja.dto"

/** `POST /transactions/cobrar`. Con `reutilizado: true` fue un reintento ya procesado (HTTP 200, no se cobró otra vez). */
export type CobroResultadoDto = {
  pedido_id: UUID
  /** Una fila por línea de pago (pago mixto = varias filas). */
  transacciones: TransaccionCajaDto[]
  estado_pago: EstadoPago
  total_pedido: Dinero
  total_pagado: Dinero
  saldo_pendiente: Dinero
  desglose: {
    subtotal_sin_igv: Dinero
    igv_18: Dinero
    total: Dinero
  }
  reutilizado: boolean
}
