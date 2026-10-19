import type { UUID } from "../core/helpers"
import type { OpcionModificadorDto } from "./opcionModificador.dto"

export type GrupoModificadorDto = {
  id_grupo: UUID
  nombre: string
  descripcion: string | null
  seleccion_minima: number
  seleccion_maxima: number
  /** true cuando `seleccion_minima` es mayor que 0: el cliente debe elegir al menos una opción. */
  obligatorio: boolean
  orden_visual: number
  opciones: OpcionModificadorDto[]
}
