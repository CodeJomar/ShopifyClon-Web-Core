import type { UUID } from "../core/helpers"

/** Cargo asignable a un empleado (`GET /users/cargos`). */
export type CargoDto = {
  id_rol: UUID
  nombre: string
  descripcion: string | null
}
