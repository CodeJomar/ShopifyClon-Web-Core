import { apiRequest } from "@/lib/api/client"
import { CheckStatus } from "@/dtos/core/checkStatus.dto"
import type { ActualizarPerfilPayload, CambiarPasswordPayload, SesionUsuarioDto } from "@/dtos/auth"

// Llamadas finas a la API NestJS (/auth): el perfil propio y el cambio de contraseña se validan en el backend.

/** Cambia el nombre para mostrar; el correo y el cargo los administra quien gestiona usuarios. */
export const actualizarPerfil = (payload: ActualizarPerfilPayload) =>
  apiRequest<CheckStatus<SesionUsuarioDto>>(CheckStatus, { method: "PATCH", url: "/auth/perfil", data: payload })

/** Exige la contraseña actual; cierra las demás sesiones del usuario y avisa por correo. */
export const cambiarPassword = (payload: CambiarPasswordPayload) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "POST", url: "/auth/cambiar-password", data: payload })
