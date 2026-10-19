import { apiRequest } from "@/lib/api/client"
import { CheckStatus } from "@/dtos/core/checkStatus.dto"
import { OneQuery } from "@/dtos/core/oneQuery.dto"
import type {
  ActividadDto,
  LoginResponseDto,
  SesionUsuarioDto,
  TokenRestablecimientoDto,
  ValidarActivacionDto,
} from "@/dtos/auth"

// Llamadas finas a la API NestJS: la autenticación, los códigos y las contraseñas se resuelven en el backend.

/** `reemplazarSesion`: el usuario confirmó cerrar la sesión activa de la cuenta para iniciar esta (modal «Continuar»). */
export const loginAction = (email: string, password: string, reemplazarSesion = false) =>
  apiRequest<OneQuery<LoginResponseDto>>(OneQuery, {
    method: "POST",
    url: "/auth/login",
    data: { email, password, ...(reemplazarSesion ? { reemplazar_sesion: true } : {}) },
  })

/** Latido de actividad real del usuario: mantiene viva la sesión (las consultas automáticas no cuentan). */
export const actividadAction = () =>
  apiRequest<CheckStatus<ActividadDto>>(CheckStatus, { method: "POST", url: "/auth/actividad", data: {} })

export const logoutAction = () =>
  apiRequest<CheckStatus>(CheckStatus, { method: "POST", url: "/auth/logout", data: {} })

export const solicitarRecuperacionAction = (email: string) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "POST", url: "/auth/recuperar", data: { email } })

export const verificarOtpAction = (email: string, codigo: string) =>
  apiRequest<OneQuery<TokenRestablecimientoDto>>(OneQuery, {
    method: "POST",
    url: "/auth/verificar-otp",
    data: { email, codigo },
  })

export const restablecerPasswordAction = (token: string, nuevaPassword: string) =>
  apiRequest<CheckStatus>(CheckStatus, {
    method: "POST",
    url: "/auth/restablecer-password",
    data: { token, nueva_password: nuevaPassword },
  })

export const validarActivacionAction = (token: string) =>
  apiRequest<OneQuery<ValidarActivacionDto>>(OneQuery, {
    method: "POST",
    url: "/auth/activar/validar",
    data: { token },
  })

export const activarCuentaAction = (token: string, password: string) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "POST", url: "/auth/activar", data: { token, password } })

export const perfilAction = () =>
  apiRequest<OneQuery<SesionUsuarioDto>>(OneQuery, { method: "GET", url: "/auth/me" })
