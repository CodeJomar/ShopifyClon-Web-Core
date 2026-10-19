import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"
import type { MetodoPago } from "./metodoPago"
import type { TipoMovimientoManual } from "./tipoMovimiento"

export type MovimientoCajaPayload = {
  tipo_movimiento: TipoMovimientoManual
  metodo_pago: MetodoPago
  monto: Dinero
  /** Motivo obligatorio (mínimo 3 caracteres). */
  notas: string
  /** Opcional: debe ser el turno abierto. */
  id_turno_caja?: UUID
}
