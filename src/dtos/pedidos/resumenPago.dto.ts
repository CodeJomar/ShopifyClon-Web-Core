import type { EstadoPago } from "../caja/estadoPago"
import type { Dinero } from "../core/dinero"

/** Resumen de pago que acompaña al pedido en el detalle y el listado. */
export type ResumenPagoDto = {
  estado_pago: EstadoPago
  total_pagado: Dinero
  saldo_pendiente: Dinero
}
