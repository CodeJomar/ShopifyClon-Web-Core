import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { CuponDto, CuponRequest } from "@/dtos/cupon"

export interface FiltrosCupones {
  texto?: string
  activo?: boolean
}

export const cuponesAction = (pagina: number = 0, filtros?: FiltrosCupones) =>
  resultado(
    peticionApi<Paginado<CuponDto>>({
      method: "GET",
      url: "/panel/cupones",
      params: {
        pagina,
        ...(filtros?.texto?.trim() ? { texto: filtros.texto.trim() } : {}),
        ...(filtros?.activo !== undefined ? { activo: filtros.activo } : {}),
      },
    }),
  )

export const cuponAction = (id: string) =>
  resultado(peticionApi<CuponDto>({ method: "GET", url: `/panel/cupones/${id}` }))

export const crearCuponAction = (datos: CuponRequest) =>
  resultado(peticionApi<CuponDto>({ method: "POST", url: "/panel/cupones", data: datos }))

export const editarCuponAction = (id: string, datos: CuponRequest) =>
  resultado(peticionApi<CuponDto>({ method: "PUT", url: `/panel/cupones/${id}`, data: datos }))

export const eliminarCuponAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/cupones/${id}` }))
