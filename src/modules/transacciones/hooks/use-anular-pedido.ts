"use client"

import * as React from "react"
import { toastResponse } from "@/shared/utils/toast-response"
import { anularPedido } from "../actions/transacciones.actions"

/** Anulación de un pedido que todavía no se cobró. */
export function useAnularPedido() {
  return React.useCallback(async (idPedido: string, motivo: string) => {
    return toastResponse(anularPedido(idPedido, motivo), {
      loading: "Anulando el pedido…",
      success: "Pedido anulado",
      error: "No se pudo anular el pedido",
    })
  }, [])
}
