import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoTurno } from "./estadoTurno"
import type { MetodoPago } from "./metodoPago"
import type { TipoMovimiento } from "./tipoMovimiento"

/** `GET /transactions/turnos/actual`: turno abierto, resumen por tipo y método, y efectivo que debería haber. */
export type TurnoActualDto = {
  turno: {
    id_turno_caja: UUID
    fecha_apertura: FechaIso
    monto_inicial: Dinero
    nota_apertura: string | null
    estado: EstadoTurno
    /** Nombre (no id) de quien abrió la caja. */
    abierto_por: string
  }
  resumen_movimientos: Array<{
    tipo_movimiento: TipoMovimiento
    metodo_pago: MetodoPago
    total: Dinero
    transacciones: number
  }>
  efectivo_esperado: Dinero
}
