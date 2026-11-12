import { Client } from "@stomp/stompjs"

/** Estado de la conexión de un canal: `reconectando` incluye el primer intento tras una caída; `cerrado` es definitivo. */
export type EstadoConexion = "conectando" | "conectado" | "reconectando" | "cerrado"

interface OpcionesCanal<T> {
  /** Destino STOMP, p. ej. `/topic/tienda/{id}/ordenes` o `/topic/ordenes/{token}`. */
  destino: string
  /**
   * Pide un ticket nuevo antes de CADA conexión y reconexión (el panel). Si devuelve `null` no hay sesión: el canal se cierra y
   * no reconecta. Sin esta función la conexión es anónima (el comprador, que solo recibe su orden).
   */
  obtenerTicket?: () => Promise<string | null>
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
        let ticket: string | null = null
        try {
          ticket = await obtenerTicket()
        } catch {
          ticket = null
        }
        if (cerrado) return
        if (!ticket) {
          // Sesión revocada o caducada: no se reconecta con un ticket viejo.
          cerrado = true
          avisar("cerrado")
          await c.deactivate()
          return
        }
        c.connectHeaders = { "X-Ws-Ticket": ticket }
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
      void cliente.deactivate()
      avisar("cerrado")
    },
  }
}
