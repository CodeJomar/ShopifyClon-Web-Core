"use client"

import * as React from "react"
import type { CobroResultadoDto, LineaPagoPayload } from "@/dtos/caja"
import { useClaveIdempotencia } from "@/shared/hooks/use-clave-idempotencia"
import { toastResponse } from "@/shared/utils/toast-response"
import { cobrarPedido } from "../actions/pos.actions"

/* -------------------------------------------------------------------------- */
/*                                    Cobro                                    */
/* -------------------------------------------------------------------------- */

export function useCobro() {
  const { obtener, reiniciar } = useClaveIdempotencia()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  /**
   * Registra los pagos de un pedido (varias líneas = pago mixto; la suma puede ser menor al saldo: cada comensal paga
   * lo suyo). Un reintento con los mismos datos reutiliza la clave y no cobra dos veces.
   */
  const cobrar = React.useCallback(
    async (idPedido: string, pagos: LineaPagoPayload[]): Promise<CobroResultadoDto | null> => {
      const payload = { id_pedido: idPedido, pagos }
      const clave = obtener(JSON.stringify(payload))

      setIsSubmitting(true)
      const res = await toastResponse(cobrarPedido(payload, clave), {
        loading: "Registrando pago...",
        success: (r) => (r.data?.estado_pago === "pagado" ? "Pedido pagado" : "Pago registrado"),
        error: "No se pudo registrar el pago",
      })
      setIsSubmitting(false)

      if (!res.isOk()) return null
      reiniciar()
      return res.data
    },
    [obtener, reiniciar],
  )

  return { cobrar, isSubmitting }
}
