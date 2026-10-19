"use client"

import type { PedidoListadoDto } from "@/dtos/pedidos"

/* -------------------------------------------------------------------------- */
/*                               Formato de fechas                            */
/* -------------------------------------------------------------------------- */

export const formatHora = (fecha: string) =>
  new Date(fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })

export const formatFechaHora = (fecha: string) =>
  new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

// Tiempo transcurrido legible (ej. "45 min", "2 h 10 min")
export const formatTranscurrido = (desde: string, hasta: string | number = Date.now()) => {
  const fin = typeof hasta === "number" ? hasta : new Date(hasta).getTime()
  const minutos = Math.max(0, Math.round((fin - new Date(desde).getTime()) / 60_000))
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

export const lugarDe = (p: Pick<PedidoListadoDto, "tipo_pedido" | "mesa_numero">): string =>
  p.tipo_pedido === "salon" && p.mesa_numero ? `Mesa ${p.mesa_numero}` : p.tipo_pedido === "delivery" ? "Delivery" : "Para llevar"
