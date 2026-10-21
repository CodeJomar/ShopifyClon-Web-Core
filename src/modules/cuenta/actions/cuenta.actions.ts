import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { DireccionDto, DireccionPayload, OrdenCuentaDto, OrdenDetalleDto, PerfilCuentaDto } from "@/dtos/cuenta"

// Llamadas a la API real (identidad.md, ordenes). Todo pasa por /api: el JWT nunca llega al navegador.

export const perfilCuentaAction = () => resultado(peticionApi<PerfilCuentaDto>({ method: "GET", url: "/cuenta/perfil" }))

export const actualizarPerfilAction = (datos: { nombres: string; apellidos: string; telefono?: string }) =>
  resultado(peticionApi<PerfilCuentaDto>({ method: "PUT", url: "/cuenta/perfil", data: datos }))

export const cambiarContrasenaAction = (datos: { contrasena_actual: string; contrasena_nueva: string }) =>
  resultado(peticionApi<void>({ method: "PUT", url: "/cuenta/contrasena", data: datos }))

export const direccionesAction = () =>
  resultado(peticionApi<DireccionDto[]>({ method: "GET", url: "/cuenta/direcciones" }))

export const crearDireccionAction = (datos: DireccionPayload) =>
  resultado(peticionApi<DireccionDto>({ method: "POST", url: "/cuenta/direcciones", data: datos }))

export const editarDireccionAction = (id: string, datos: DireccionPayload) =>
  resultado(peticionApi<DireccionDto>({ method: "PUT", url: `/cuenta/direcciones/${id}`, data: datos }))

export const eliminarDireccionAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/cuenta/direcciones/${id}` }))

export const marcarDireccionPrincipalAction = (id: string) =>
  resultado(peticionApi<void>({ method: "POST", url: `/cuenta/direcciones/${id}/principal` }))

export const ordenesCuentaAction = (pagina: number) =>
  resultado(peticionApi<Paginado<OrdenCuentaDto>>({ method: "GET", url: "/cuenta/ordenes", params: { pagina } }))

export const ordenCuentaAction = (id: string) =>
  resultado(peticionApi<OrdenDetalleDto>({ method: "GET", url: `/cuenta/ordenes/${id}` }))
