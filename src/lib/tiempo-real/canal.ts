import { Client } from "@stomp/stompjs"
import type { ResultadoTicket } from "./ticket"

/** Estado de la conexión de un canal: `reconectando` incluye el primer intento tras una caída; `cerrado` es definitivo. */
export type EstadoConexion = "conectando" | "conectado" | "reconectando" | "cerrado"

interface OpcionesCanal<T> {
  /** Destino STOMP, p. ej. `/topic/tienda/{id}/ordenes` o `/topic/ordenes/{token}`. */
  destino: string
  /**
   * Pide un ticket nuevo antes de CADA conexión y reconexión (el panel). Con `sin-sesion` (401) el canal se cierra y no reconecta;
   * con `error` (429, 502, corte de red…) reintenta con el mismo retardo creciente. Sin esta función la conexión es anónima
   * (el comprador, que solo recibe su orden).
   */
  obtenerTicket?: () => Promise<ResultadoTicket>
  alMensaje: (mensaje: T) => void
  alCambiarEstado?: (estado: EstadoConexion) => void
}

const RETARDO_INICIAL_MS = 1_000
const RETARDO_MAXIMO_MS = 30_000
const HEARTBEAT_MS = 10_000

/**
 * Abre un canal STOMP sobre WebSocket nativo (sin SockJS) hacia `NEXT_PUBLIC_WS_URL`. Reconecta con retardo creciente (1 s hasta
 * 30 s), pide ticket nuevo en cada intento y se cierra con `cerrar()` (al desmontar, al cerrar sesión o al cambiar de tienda).
 * Sin `NEXT_PUBLIC_WS_URL` no abre nada y queda `cerrado`: la pantalla sigue funcionando por consulta.
 */
export function abrirCanal<T>({ destino, obtenerTicket, alMensaje, alCambiarEstado }: OpcionesCanal<T>): { cerrar: () => void } {
  const url = process.env.NEXT_PUBLIC_WS_URL
  if (!url || typeof WebSocket === "undefined") {
    alCambiarEstado?.("cerrado")
    return { cerrar: () => undefined }
  }

  let cerrado = false
  let retardo = RETARDO_INICIAL_MS
  let reintentoTicket: ReturnType<typeof setTimeout> | undefined
  const avisar = (estado: EstadoConexion) => {
    if (!cerrado || estado === "cerrado") alCambiarEstado?.(estado)
  }

  const cliente = new Client({
    brokerURL: url,
    reconnectDelay: RETARDO_INICIAL_MS,
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,
    beforeConnect: async (c) => {
      if (obtenerTicket) {
        let resultado: ResultadoTicket
        try {
          resultado = await obtenerTicket()
        } catch {
          resultado = { tipo: "error" }
        }
        if (cerrado) return
        if (resultado.tipo === "sin-sesion") {
          // Sesión revocada o caducada (401): no se reconecta con un ticket viejo.
          cerrado = true
          avisar("cerrado")
          await c.deactivate()
          return
        }
        if (resultado.tipo === "error") {
          // Fallo transitorio al pedir el ticket (429, 502, corte de red…): se cancela este intento (aún no hay socket, así que
          // deactivate() termina al instante) y se vuelve a activar tras el retardo creciente, sin cerrar el canal.
          avisar("reconectando")
          const espera = retardo
          retardo = Math.min(retardo * 2, RETARDO_MAXIMO_MS)
          await c.deactivate()
          reintentoTicket = setTimeout(() => {
            if (!cerrado) c.activate()
          }, espera)
          return
        }
        c.connectHeaders = { "X-Ws-Ticket": resultado.ticket }
      }
      c.reconnectDelay = retardo
      retardo = Math.min(retardo * 2, RETARDO_MAXIMO_MS)
    },
    onConnect: () => {
      retardo = RETARDO_INICIAL_MS
      avisar("conectado")
      cliente.subscribe(destino, (m) => {
        try {
          alMensaje(JSON.parse(m.body) as T)
        } catch {
          // Mensaje que no es JSON: se ignora.
        }
      })
    },
    onWebSocketClose: () => avisar("reconectando"),
    onStompError: () => avisar("reconectando"),
  })

  avisar("conectando")
  cliente.activate()

  return {
    cerrar: () => {
      cerrado = true
      if (reintentoTicket) clearTimeout(reintentoTicket)
      void cliente.deactivate()
      avisar("cerrado")
    },
  }
}
