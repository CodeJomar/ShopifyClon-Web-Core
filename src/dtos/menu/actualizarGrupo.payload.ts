import type { CrearGrupoPayload } from "./crearGrupo.payload"

export type ActualizarGrupoPayload = Partial<Omit<CrearGrupoPayload, "opciones">>
