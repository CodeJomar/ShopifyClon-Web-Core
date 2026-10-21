import { api, peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { LoginDatosDto, PerfilDto } from "@/dtos/auth"

// Llamadas a la API real (identidad.md). Todas pasan por /api (proxy de la web): el JWT nunca llega al navegador.

export const registroAction = (datos: {
  correo_electronico: string
  contrasena: string
  nombres: string
  apellidos: string
  telefono?: string
}) => resultado(peticionApi<{ id: string }>({ method: "POST", url: "/auth/registro", data: datos }))

export const activarAction = (correo_electronico: string, codigo: string) =>
  resultado(peticionApi<void>({ method: "POST", url: "/auth/activar", data: { correo_electronico, codigo } }))

export const reenviarActivacionAction = (correo_electronico: string) =>
  resultado(peticionApi<void>({ method: "POST", url: "/auth/reenviar-activacion", data: { correo_electronico } }))

export const loginAction = (correo_electronico: string, contrasena: string) =>
  resultado(peticionApi<LoginDatosDto>({ method: "POST", url: "/auth/login", data: { correo_electronico, contrasena } }))

export const solicitarRecuperacionAction = (correo_electronico: string) =>
  resultado(peticionApi<void>({ method: "POST", url: "/auth/recuperar-clave/solicitar", data: { correo_electronico } }))

export const confirmarRecuperacionAction = (correo_electronico: string, codigo: string, contrasena_nueva: string) =>
  resultado(
    peticionApi<void>({
      method: "POST",
      url: "/auth/recuperar-clave/confirmar",
      data: { correo_electronico, codigo, contrasena_nueva },
    }),
  )

export const perfilAction = () => resultado(peticionApi<PerfilDto>({ method: "GET", url: "/cuenta/perfil" }))

/** Cierra la sesión de la web (borra las cookies). La API no tiene logout. */
export const cerrarSesionAction = () => resultado(api.delete("/sesion").then(() => undefined))
