import type { CrearOpcionPayload } from "./crearOpcion.payload"

export type CrearGrupoPayload = {
  nombre: string
  descripcion?: string
  seleccion_minima?: number
  seleccion_maxima?: number
  orden_visual?: number
  opciones?: CrearOpcionPayload[]
}
