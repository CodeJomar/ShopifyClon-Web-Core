import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { TicketWs } from "@/dtos/tiempo-real"

/**
 * Resultado de pedir un ticket para conectar el panel al WebSocket. Importa distinguir los tres casos:
 * - `ok`: hay ticket (de un solo uso).
 * - `sin-sesion`: la API respondió 401, la sesión terminó o fue revocada. No tiene sentido reintentar.
 * - `error`: fallo transitorio (límite de peticiones 429, 502 del proxy, corte de red, API reiniciándose). Hay que reintentar.
 */
export type ResultadoTicket = { tipo: "ok"; ticket: string } | { tipo: "sin-sesion" } | { tipo: "error" }

/**
 * Pide un ticket de un solo uso (POST /auth/ws-ticket, por el proxy `/api`: el JWT nunca sale de la cookie httpOnly).
 * Hay que pedir uno nuevo en cada conexión y reconexión.
 */
export async function pedirTicketWs(): Promise<ResultadoTicket> {
  try {
    const res = await resultado(peticionApi<TicketWs>({ method: "POST", url: "/auth/ws-ticket" }))
    if (res.ok) return res.datos?.ticket ? { tipo: "ok", ticket: res.datos.ticket } : { tipo: "error" }
    return res.error.estado === 401 ? { tipo: "sin-sesion" } : { tipo: "error" }
  } catch {
    return { tipo: "error" }
  }
}
