import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"

/** Devolución total o parcial de un cobro (permiso `TRANSACTIONS:DEVOLVER`). Exige `Idempotency-Key`. */
export type DevolucionPayload = {
  id_transaccion_origen: UUID
  monto: Dinero
  motivo: string
}
