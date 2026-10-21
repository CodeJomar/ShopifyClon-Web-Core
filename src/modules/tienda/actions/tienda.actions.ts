import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { MiTiendaDto, PlanDto, TiendaActivaDto, TiendaCreadaDto } from "@/dtos/tienda"

// Llamadas a la API real (tiendas-y-personal.md). Todo pasa por /api: el JWT y la tienda activa viven en cookies httpOnly.

export const planesAction = () => resultado(peticionApi<PlanDto[]>({ method: "GET", url: "/planes" }))

export const crearTiendaAction = (datos: {
  nombre: string
  subdominio: string
  correo_contacto?: string
  moneda: string
  codigo_plan: string
}) => resultado(peticionApi<TiendaCreadaDto>({ method: "POST", url: "/cuenta/tiendas", data: datos }))

export const misTiendasAction = () => resultado(peticionApi<MiTiendaDto[]>({ method: "GET", url: "/cuenta/tiendas" }))

/** Fija la tienda activa (cookie otemu_tienda). La API valida la pertenencia en cada uso (SEG-001). */
export const fijarTiendaAction = (tiendaId: string) =>
  resultado(peticionApi<void>({ method: "PUT", url: "/sesion", data: { tienda_id: tiendaId } }))

/** Tienda activa según la cookie; sin tienda → SEG-001 (404). */
export const tiendaActivaAction = () => resultado(peticionApi<TiendaActivaDto>({ method: "GET", url: "/panel/tienda" }))
