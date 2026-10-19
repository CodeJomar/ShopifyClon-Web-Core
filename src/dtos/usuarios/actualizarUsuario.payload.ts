import type { UUID } from "../core/helpers"
import type { EstadoUsuarioEditable } from "./estadoUsuario"
import type { FichaEmpleadoPayload } from "./fichaEmpleado.payload"

export type ActualizarUsuarioPayload = FichaEmpleadoPayload &
  Partial<{
    id_rol: UUID
    email: string
    nombre: string
    estado: EstadoUsuarioEditable
  }>
