import type { Dinero } from "../core/dinero"
import type { MetodoPago } from "./metodoPago"

export type LineaPagoPayload = {
  metodo_pago: MetodoPago
  monto: Dinero
}
