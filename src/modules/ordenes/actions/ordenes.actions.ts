import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { EnvioOrden, OrdenDetallePanel, OrdenLista, PagoOrden } from "@/dtos/ordenes"

// Órdenes del panel de la tienda activa (X-Tienda-Id lo pone el proxy). La API decide permisos y transiciones.

export interface FiltrosOrdenes {
  texto?: string
  estado?: string
  estado_pago?: string
  estado_preparacion?: string
  desde?: string
  hasta?: string
}

export const listarOrdenesAction = (pagina: number, filtros: FiltrosOrdenes) =>
  resultado(
    peticionApi<Paginado<OrdenLista>>({
      method: "GET",
      url: "/panel/ordenes",
      params: { pagina, ...Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)) },
    }),
  )

export const ordenAction = (id: string) =>
  resultado(peticionApi<OrdenDetallePanel>({ method: "GET", url: `/panel/ordenes/${id}` }))

export const pagosOrdenAction = (id: string) =>
  resultado(peticionApi<PagoOrden[]>({ method: "GET", url: `/panel/ordenes/${id}/pagos` }))

/** 404 cuando la orden aún no tiene envío: la pantalla lo trata como "sin envío". */
export const envioOrdenAction = (id: string) =>
  resultado(peticionApi<EnvioOrden>({ method: "GET", url: `/panel/ordenes/${id}/envio` }))

export const crearEnvioAction = (id: string, datos: Record<string, unknown>) =>
  resultado(peticionApi<EnvioOrden>({ method: "POST", url: `/panel/ordenes/${id}/envio`, data: datos }))

export const editarEnvioAction = (envioId: string, datos: Record<string, unknown>) =>
  resultado(peticionApi<EnvioOrden>({ method: "PUT", url: `/panel/envios/${envioId}`, data: datos }))

export const despacharEnvioAction = (envioId: string) =>
  resultado(peticionApi<EnvioOrden>({ method: "POST", url: `/panel/envios/${envioId}/despachar` }))

export const entregarEnvioAction = (envioId: string) =>
  resultado(peticionApi<EnvioOrden>({ method: "POST", url: `/panel/envios/${envioId}/entregar` }))

export const devolverEnvioAction = (envioId: string) =>
  resultado(peticionApi<EnvioOrden>({ method: "POST", url: `/panel/envios/${envioId}/devolver` }))

export const registrarPagoManualAction = (id: string, referencia?: string) =>
  resultado(
    peticionApi<PagoOrden>({ method: "POST", url: `/panel/ordenes/${id}/pagos/manual`, data: referencia ? { referencia } : {} }),
  )

export const cancelarOrdenAction = (id: string, datos: { motivo: string; detalle?: string; reponer_stock?: boolean }) =>
  resultado(peticionApi<void>({ method: "POST", url: `/panel/ordenes/${id}/cancelar`, data: datos }))

export const reembolsarOrdenAction = (
  id: string,
  datos: { monto: number; motivo: string; reponer?: { variante_id: string; cantidad: number }[] },
) => resultado(peticionApi<PagoOrden>({ method: "POST", url: `/panel/ordenes/${id}/reembolsos`, data: datos }))
