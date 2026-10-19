import type { Dinero } from "../core/dinero"
import type { UUID } from "../core/helpers"

export type OpcionModificadorDto = {
  id_opcion: UUID
  nombre: string
  /** Variación de precio con signo ("0.00", "1.50", "-0.50"). */
  price_delta: Dinero
  disponible: boolean
  orden_visual: number
}
