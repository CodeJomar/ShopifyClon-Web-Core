import type { PermisoDto } from "./permiso.dto"

/** Reemplaza TODOS los permisos del rol. Un usuario solo puede conceder los permisos que él mismo tiene. */
export type ReemplazarPermisosPayload = {
  permisos: PermisoDto[]
}
