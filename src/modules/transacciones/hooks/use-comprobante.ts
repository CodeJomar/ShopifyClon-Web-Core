"use client"

import * as React from "react"
import type { ComprobanteDto, EventoPedidoDto } from "@/dtos/pedidos"
import { toastResponse } from "@/shared/utils/toast-response"
import { getBitacoraPedido, getComprobante, reimprimirComprobante } from "../actions/transacciones.actions"

export type ComprobanteAbierto = ComprobanteDto & { id_pedido: string }

/** Comprobante de un pedido (con sus pagos, devoluciones y bitácora), que se abre en un modal. */
export function useComprobante() {
  const [comprobante, setComprobante] = React.useState<ComprobanteAbierto | null>(null)
  const [eventos, setEventos] = React.useState<EventoPedidoDto[]>([])
  const [reimprimiendo, setReimprimiendo] = React.useState(false)

  const consultar = React.useCallback(async (idPedido: string) => {
    const respuesta = await toastResponse(getComprobante(idPedido), {
      loading: "Cargando el comprobante…",
      success: "Comprobante listo",
      error: "No se pudo cargar el comprobante",
    })
    if (respuesta.isOk()) {
      const bitacora = await getBitacoraPedido(idPedido)
      setEventos(bitacora.isOk() ? (bitacora.data ?? []) : [])
      setComprobante({ ...respuesta.data, id_pedido: idPedido })
    }
    return respuesta
  }, [])

  // Vuelve a pedir el comprobante y su bitácora sin avisos (tras una devolución, por ejemplo)
  const actualizar = React.useCallback(async (idPedido: string) => {
    const [respuesta, bitacora] = await Promise.all([getComprobante(idPedido), getBitacoraPedido(idPedido)])
    if (respuesta.isOk()) setComprobante({ ...respuesta.data, id_pedido: idPedido })
    if (bitacora.isOk()) setEventos(bitacora.data ?? [])
  }, [])

  /** Pide la reimpresión (queda registrada en la bitácora) y abre el diálogo de impresión del navegador. */
  const reimprimir = React.useCallback(
    async (idPedido: string) => {
      setReimprimiendo(true)
      const respuesta = await toastResponse(reimprimirComprobante(idPedido), {
        loading: "Preparando la copia…",
        success: (r) => `Copia N° ${r.data?.reimpresiones ?? ""} registrada`,
        error: "No se pudo reimprimir el comprobante",
      })
      setReimprimiendo(false)
      if (!respuesta.isOk()) return
      await actualizar(idPedido)
      window.print()
    },
    [actualizar],
  )

  const cerrar = React.useCallback(() => {
    setComprobante(null)
    setEventos([])
  }, [])

  return { comprobante, eventos, reimprimiendo, consultar, actualizar, reimprimir, cerrar }
}
