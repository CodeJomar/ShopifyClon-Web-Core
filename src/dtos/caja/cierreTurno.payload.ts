import type { Dinero } from "../core/dinero"
import type { ConteoArqueo } from "./denominacion"

export type CierreTurnoPayload = {
  monto_final_real: Dinero
  notas_cierre?: string
  /** Conteo físico por denominación. Si se envía, su suma debe coincidir con `monto_final_real`; queda guardado. */
  conteo?: ConteoArqueo
}
