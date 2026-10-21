import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type {
  ActividadDto,
  LoginResponseDto,
  SesionUsuarioDto,
  TokenRestablecimientoDto,
  ValidarActivacionDto,
} from "@/dtos/auth"

// Llamadas finas a la API Spring: la autenticación, los códigos y las contraseñas se resuelven en el backend.

/** `reemplazarSesion`: el usuario confirmó cerrar la sesión activa de la cuenta para iniciar esta (modal «Continuar»). */
export const loginAction = (email: string, password: string, reemplazarSesion = false) =>
  resultado(peticionApi<LoginResponseDto>({
    method: "POST",
    url: "/auth/login",
    data: { email, password, ...(reemplazarSesion ? { reemplazar_sesion: true } : {}) },
  }))

/** Latido de actividad real del usuario: mantiene viva la sesión (las consultas automáticas no cuentan). */
export const actividadAction = () =>
  resultado(peticionApi<ActividadDto>({ method: "POST", url: "/auth/actividad", data: {} }))

export const logoutAction = () =>
  resultado(peticionApi<void>({ method: "POST", url: "/auth/logout", data: {} }))

export const solicitarRecuperacionAction = (email: string) =>
  resultado(peticionApi<void>({ method: "POST", url: "/auth/recuperar", data: { email } }))

export const verificarOtpAction = (email: string, codigo: string) =>
  resultado(peticionApi<TokenRestablecimientoDto>({
    method: "POST",
    url: "/auth/verificar-otp",
    data: { email, codigo },
  }))

export const restablecerPasswordAction = (token: string, nuevaPassword: string) =>
  resultado(peticionApi<void>({
    method: "POST",
    url: "/auth/restablecer-password",
    data: { token, nueva_password: nuevaPassword },
  }))

export const validarActivacionAction = (token: string) =>
  resultado(peticionApi<ValidarActivacionDto>({
    method: "POST",
    url: "/auth/activar/validar",
    data: { token },
  }))

export const activarCuentaAction = (token: string, password: string) =>
  resultado(peticionApi<void>({ method: "POST", url: "/auth/activar", data: { token, password } }))

export const perfilAction = () =>
  resultado(peticionApi<SesionUsuarioDto>({ method: "GET", url: "/auth/me" }))
