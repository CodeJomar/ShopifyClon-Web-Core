import type { PermisoDto } from "./permiso.dto"

export type CrearRolPayload = {
  nombre: string
  descripcion?: string
  permisos?: PermisoDto[]
}
