import type { SesionUsuarioDto } from "./sesionUsuario.dto"

export type LoginResponseDto = {
  usuario: SesionUsuarioDto
  expira_en_segundos: number
}
