import type { Dinero } from "../core/dinero"
import type { EntidadAuditada } from "../core/entidadAuditada"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { ConteoArqueo } from "./denominacion"
import type { EstadoTurno } from "./estadoTurno"

/** Turno de caja tal como lo devuelven apertura y cierre. */
export type TurnoCajaDto = EntidadAuditada & {
  id_turno_caja: UUID
  fecha_apertura: FechaIso
  fecha_cierre: FechaIso | null
  monto_inicial: Dinero
  monto_final_calculado: Dinero
  monto_final_real: Dinero | null
  diferencia: Dinero
  estado: EstadoTurno
  notas_cierre: string | null
  nota_apertura: string | null
  /** Conteo por denominación del arqueo; null si el cierre no lo envió. */
  conteo_cierre: ConteoArqueo | null
}
