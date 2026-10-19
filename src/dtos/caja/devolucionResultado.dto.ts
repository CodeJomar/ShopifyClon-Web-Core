import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"
import type { EstadoPago } from "./estadoPago"
import type { TransaccionCajaDto } from "./transaccionCaja.dto"

/** `POST /transactions/devoluciones`. */
export type DevolucionResultadoDto = {
  devolucion: TransaccionCajaDto
  pedido_id: UUID
  estado_pago: EstadoPago
  total_pagado: Dinero
  total_devuelto: Dinero
  neto_cobrado: Dinero
  reutilizado: boolean
}
