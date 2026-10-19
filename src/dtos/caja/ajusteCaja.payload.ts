import type { Dinero } from "../core/dinero"
import type { MetodoPago } from "./metodoPago"
import type { TipoMovimientoManual } from "./tipoMovimiento"

/** Corrección auditable sobre un turno ya cerrado (permiso `TRANSACTIONS:AJUSTAR`, por defecto solo el propietario). */
export type AjusteCajaPayload = {
  tipo_movimiento: TipoMovimientoManual
  metodo_pago: MetodoPago
  monto: Dinero
  motivo: string
}
