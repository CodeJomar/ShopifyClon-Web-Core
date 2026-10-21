import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type {
  AgregarPersonalRequest,
  CambiarRolRequest,
  MiembroPersonalDto,
  QuitarPersonalRequest,
} from "@/dtos/personal"

// Gestión de personal de la tienda activa (X-Tienda-Id agregado por el proxy). Permiso PERSONAL_GESTIONAR.

export const personalAction = () =>
  resultado(peticionApi<MiembroPersonalDto[]>({ method: "GET", url: "/panel/personal" }))

export const agregarPersonalAction = (datos: AgregarPersonalRequest) =>
  resultado(peticionApi<MiembroPersonalDto>({ method: "POST", url: "/panel/personal", data: datos }))

export const cambiarRolAction = (usuarioId: string, datos: CambiarRolRequest) =>
  resultado(peticionApi<MiembroPersonalDto>({ method: "PUT", url: `/panel/personal/${usuarioId}`, data: datos }))

export const quitarPersonalAction = (usuarioId: string, datos: QuitarPersonalRequest) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/personal/${usuarioId}`, data: datos }))
