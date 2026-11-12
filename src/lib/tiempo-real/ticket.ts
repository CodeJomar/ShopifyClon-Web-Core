import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { TicketWs } from "@/dtos/tiempo-real"

/**
 * Pide un ticket de un solo uso para conectar el panel al WebSocket (POST /auth/ws-ticket, por el proxy `/api`: el JWT nunca
 * sale de la cookie httpOnly). Devuelve `null` si no hay sesión válida (401): quien llama no debe reintentar.
 * Hay que pedir uno nuevo en cada conexión y reconexión.
 */
export async function pedirTicketWs(): Promise<string | null> {
  const res = await resultado(peticionApi<TicketWs>({ method: "POST", url: "/auth/ws-ticket" }))
  return res.ok ? res.datos.ticket : null
}
