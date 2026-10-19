import { io, type Socket } from "socket.io-client"

import { apiRequest } from "@/lib/api/client"
import { OneQuery } from "@/dtos/core"
import { env } from "@/env"
import {
  EVENTOS_KDS,
  type ComandaEstadoEventoDto,
  type ItemActualizadoEventoDto,
  type TarjetaKdsDto,
  type WsTicketDto,
} from "@/dtos/kds"
import type { CatalogoActualizadoEventoDto } from "@/dtos/menu"
import type { MesaEstadoEventoDto } from "@/dtos/mesas"
import type { PagoActualizadoEventoDto } from "@/dtos/pedidos"

/** Qué hacer con cada evento en tiempo real. Todos son opcionales: cada pantalla escucha solo lo suyo. */
export interface ManejadoresTiempoReal {
  onNuevaComanda?: (tarjeta: TarjetaKdsDto) => void
  onComandaEstado?: (evento: ComandaEstadoEventoDto) => void
  onItemActualizado?: (evento: ItemActualizadoEventoDto) => void
  onMesaEstado?: (evento: MesaEstadoEventoDto) => void
  onPagoActualizado?: (evento: PagoActualizadoEventoDto) => void
  onCatalogoActualizado?: (evento: CatalogoActualizadoEventoDto) => void
  /** true al (re)conectar, false al perder la conexión. */
  onConexion?: (conectado: boolean) => void
}

async function pedirTicket(): Promise<string> {
  const res = await apiRequest<OneQuery<WsTicketDto>>(OneQuery, { method: "POST", url: "/auth/ws-ticket", data: {} })
  return res.isOk() ? res.data.ticket : ""
}

/**
 * Abre el WebSocket del KDS (namespace `kds`) y reparte los eventos. Cada intento de conexión pide un ticket nuevo
 * (dura 30 s y es de un solo uso), así que las reconexiones automáticas funcionan sin guardar credenciales.
 * Devuelve la función que cierra la conexión, o null si no hay `NEXT_PUBLIC_WS_URL` (la pantalla usa solo sondeo).
 */
export function conectarTiempoReal(manejadores: ManejadoresTiempoReal): (() => void) | null {
  const base = env.NEXT_PUBLIC_WS_URL
  if (!base) return null

  const socket: Socket = io(`${base.replace(/\/$/, "")}/kds`, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelayMax: 10_000,
    auth: (entregar) => {
      void pedirTicket().then((ticket) => entregar({ ticket }))
    },
  })

  socket.on("connect", () => manejadores.onConexion?.(true))
  socket.on("disconnect", () => manejadores.onConexion?.(false))
  socket.on("connect_error", () => manejadores.onConexion?.(false))

  if (manejadores.onNuevaComanda) socket.on(EVENTOS_KDS.nuevaComanda, manejadores.onNuevaComanda)
  if (manejadores.onComandaEstado) socket.on(EVENTOS_KDS.comandaEstado, manejadores.onComandaEstado)
  if (manejadores.onItemActualizado) socket.on(EVENTOS_KDS.itemActualizado, manejadores.onItemActualizado)
  if (manejadores.onMesaEstado) socket.on(EVENTOS_KDS.mesaEstado, manejadores.onMesaEstado)
  if (manejadores.onPagoActualizado) socket.on(EVENTOS_KDS.pagoActualizado, manejadores.onPagoActualizado)
  if (manejadores.onCatalogoActualizado) socket.on(EVENTOS_KDS.catalogoActualizado, manejadores.onCatalogoActualizado)

  return () => {
    socket.removeAllListeners()
    socket.disconnect()
  }
}
