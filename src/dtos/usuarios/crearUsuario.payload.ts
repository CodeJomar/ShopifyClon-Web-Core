import type { UUID } from "../core/helpers"
import type { FichaEmpleadoPayload } from "./fichaEmpleado.payload"

/** Crea el empleado en `pendiente_activacion` y le envía el correo de activación. */
export type CrearUsuarioPayload = FichaEmpleadoPayload & {
  id_rol: UUID
  email: string
  nombre: string
}
