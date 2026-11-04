import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type {
  EntregaRequest,
  EnvioDisponible,
  EventoEnvio,
  RutaDetalle,
  RutaLista,
  RutaRequest,
  SeguimientoPublico,
} from "@/dtos/ruta"

export const listarRutasAction = (pagina: number, estado?: string) =>
  resultado(
    peticionApi<Paginado<RutaLista>>({ method: "GET", url: "/panel/rutas", params: { pagina, ...(estado ? { estado } : {}) } }),
  )

export const rutaAction = (id: string) => resultado(peticionApi<RutaDetalle>({ method: "GET", url: `/panel/rutas/${id}` }))

export const crearRutaAction = (datos: RutaRequest) =>
  resultado(peticionApi<RutaDetalle>({ method: "POST", url: "/panel/rutas", data: datos }))

export const editarRutaAction = (id: string, datos: RutaRequest) =>
  resultado(peticionApi<RutaDetalle>({ method: "PUT", url: `/panel/rutas/${id}`, data: datos }))

export const iniciarRutaAction = (id: string) =>
  resultado(peticionApi<RutaDetalle>({ method: "POST", url: `/panel/rutas/${id}/iniciar` }))

export const finalizarRutaAction = (id: string) =>
  resultado(peticionApi<RutaDetalle>({ method: "POST", url: `/panel/rutas/${id}/finalizar` }))

export const enviosDisponiblesAction = () =>
  resultado(peticionApi<EnvioDisponible[]>({ method: "GET", url: "/panel/envios/disponibles-para-ruta" }))

export const eventosEnvioAction = (envioId: string) =>
  resultado(peticionApi<EventoEnvio[]>({ method: "GET", url: `/panel/envios/${envioId}/eventos` }))

export const entregarEnvioAction = (envioId: string, datos: EntregaRequest = {}) =>
  resultado(peticionApi<unknown>({ method: "POST", url: `/panel/envios/${envioId}/entregar`, data: datos }))

export const noEntregadoAction = (envioId: string, nota: string) =>
  resultado(peticionApi<unknown>({ method: "POST", url: `/panel/envios/${envioId}/no-entregado`, data: { nota } }))

export const seguimientoPublicoAction = (numeroGuia: string) =>
  resultado(peticionApi<SeguimientoPublico>({ method: "GET", url: `/seguimiento/${encodeURIComponent(numeroGuia)}` }))
