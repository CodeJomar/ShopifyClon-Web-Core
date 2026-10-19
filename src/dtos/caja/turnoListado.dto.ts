import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { ConteoArqueo } from "./denominacion"
import type { EstadoTurno } from "./estadoTurno"

/** Fila de `GET /transactions/turnos` (paginada, más recientes primero). El propietario ve todos; los demás, los suyos. */
export type TurnoListadoDto = {
  id_turno_caja: UUID
  fecha_apertura: FechaIso
  fecha_cierre: FechaIso | null
  monto_inicial: Dinero
  monto_final_calculado: Dinero
  monto_final_real: Dinero | null
  diferencia: Dinero
  estado: EstadoTurno
  nota_apertura: string | null
  notas_cierre: string | null
  conteo_cierre: ConteoArqueo | null
  /** Nombre de quien abrió el turno. */
  abierto_por: string
  /** Nombre de quien lo cerró; null si sigue abierto. */
  cerrado_por: string | null
  total_ventas: Dinero
  total_devoluciones: Dinero
  /** Cantidad de movimientos del libro de caja en el turno. */
  movimientos: number
}
