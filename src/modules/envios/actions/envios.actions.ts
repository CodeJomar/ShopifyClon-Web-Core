import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { TarifaEnvioDto, TarifaEnvioRequest } from "@/dtos/envio"

export const tarifasEnvioAction = () =>
  resultado(peticionApi<TarifaEnvioDto[]>({ method: "GET", url: "/panel/envios/tarifas" }))

export const crearTarifaEnvioAction = (datos: TarifaEnvioRequest) =>
  resultado(peticionApi<TarifaEnvioDto>({ method: "POST", url: "/panel/envios/tarifas", data: datos }))

export const editarTarifaEnvioAction = (id: string, datos: TarifaEnvioRequest) =>
  resultado(peticionApi<TarifaEnvioDto>({ method: "PUT", url: `/panel/envios/tarifas/${id}`, data: datos }))

export const eliminarTarifaEnvioAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/envios/tarifas/${id}` }))
