"use client"

import * as React from "react"
import type { PedidoCreadoDto } from "@/dtos/pedidos"
import { useClaveIdempotencia } from "@/shared/hooks/use-clave-idempotencia"
import { toastResponse } from "@/shared/utils/toast-response"
import { crearPedido } from "../actions/pos.actions"
import { itemsParaPedido, type ItemCarrito, type TipoAtencion } from "../schema"

/* -------------------------------------------------------------------------- */
/*                 Envío de la comanda a cocina (crear el pedido)              */
/* -------------------------------------------------------------------------- */

export function useEnvioPedido() {
  const { obtener, reiniciar } = useClaveIdempotencia()
  const [isSending, setIsSending] = React.useState(false)
  const [pedidoEnviado, setPedidoEnviado] = React.useState<PedidoCreadoDto | null>(null)

  /**
   * Crea el pedido. La misma comanda reintentada (doble toque, red caída) reutiliza la clave y no se duplica.
   * Devuelve el pedido creado o null si la API lo rechazó (caja cerrada, producto agotado, mesa por limpiar...).
   */
  const enviar = React.useCallback(
    async (
      items: readonly ItemCarrito[],
      tipo: TipoAtencion,
      idMesa: string | null,
      nombreCliente = "",
    ): Promise<PedidoCreadoDto | null> => {
      const cliente = nombreCliente.trim()
      const payload = {
        tipo_pedido: tipo,
        ...(tipo === "salon" && idMesa ? { id_mesa: idMesa } : {}),
        ...(cliente ? { cliente_nombre: cliente } : {}),
        items: itemsParaPedido(items),
      }
      const clave = obtener(JSON.stringify(payload))

      setIsSending(true)
      const res = await toastResponse(crearPedido(payload, clave), {
        loading: "Enviando comanda...",
        success: "Comanda enviada a cocina",
        error: "No se pudo enviar la comanda",
      })
      setIsSending(false)

      if (!res.isOk()) return null
      reiniciar()
      setPedidoEnviado(res.data)
      return res.data
    },
    [obtener, reiniciar],
  )

  const limpiar = React.useCallback(() => setPedidoEnviado(null), [])

  return { enviar, isSending, pedidoEnviado, limpiar }
}
