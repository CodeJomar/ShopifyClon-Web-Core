"use client"

import * as React from "react"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { abrirCanal, type EstadoConexion } from "@/lib/tiempo-real/canal"
import { pedirTicketWs } from "@/lib/tiempo-real/ticket"
import type { NotificacionOrdenTienda } from "@/dtos/tiempo-real"

type Oyente = (notificacion: NotificacionOrdenTienda) => void

interface TiempoRealPanelValor {
  estado: EstadoConexion
  /** Registra un oyente de los eventos de órdenes y envíos de la tienda; devuelve la función para quitarlo. */
  suscribir: (oyente: Oyente) => () => void
}

const Contexto = React.createContext<TiempoRealPanelValor>({ estado: "cerrado", suscribir: () => () => undefined })

/** Texto del aviso para cada evento: «Orden #1001 de Ana — S/ 105,00 pagada». */
function aviso(n: NotificacionOrdenTienda): { titulo: string; descripcion?: string; tipo: "success" | "info" | "warning" } {
  const cliente = n.nombre_cliente ? ` de ${n.nombre_cliente}` : ""
  const monto = n.total != null && n.moneda ? ` — ${formatearDinero(n.total, n.moneda)}` : ""
  switch (n.tipo) {
    case "ORDEN_CREADA":
      return { titulo: "Nueva orden", descripcion: `Orden ${n.numero_orden}${cliente}${monto}`, tipo: "info" }
    case "ORDEN_PAGADA":
      return { titulo: "Orden pagada", descripcion: `Orden ${n.numero_orden}${cliente}${monto} pagada`, tipo: "success" }
    case "ORDEN_CANCELADA":
      return { titulo: "Orden cancelada", descripcion: `Orden ${n.numero_orden}${cliente}${n.motivo ? ` — ${n.motivo}` : ""}`, tipo: "warning" }
    case "ENVIO_DESPACHADO":
      return { titulo: "Envío despachado", descripcion: `Orden ${n.numero_orden}${n.numero_guia ? ` — guía ${n.numero_guia}` : ""}`, tipo: "info" }
    case "ENVIO_ENTREGADO":
      return { titulo: "Envío entregado", descripcion: `Orden ${n.numero_orden}${cliente}`, tipo: "success" }
    default:
      return { titulo: "Novedad en tus órdenes", descripcion: n.numero_orden, tipo: "info" }
  }
}

/**
 * Un solo socket por pestaña para el panel: se abre con la tienda activa y cierra al cambiar de tienda, al cerrar sesión o al salir
 * del panel (se desmonta). Cada evento muestra un aviso y se reparte a quien lo escuche (`useEventosOrdenes`) para refrescar su
 * lista. Si la sesión se revoca, el siguiente ticket da 401 y el canal se cierra sin reintentar.
 */
export function TiempoRealPanelProvider({ tiendaId, activo, children }: { tiendaId?: string; activo: boolean; children: React.ReactNode }) {
  const [estado, setEstado] = React.useState<EstadoConexion>("cerrado")
  const oyentes = React.useRef(new Set<Oyente>())

  const suscribir = React.useCallback((oyente: Oyente) => {
    oyentes.current.add(oyente)
    return () => {
      oyentes.current.delete(oyente)
    }
  }, [])

  React.useEffect(() => {
    if (!activo || !tiendaId) return
    const canal = abrirCanal<NotificacionOrdenTienda>({
      destino: `/topic/tienda/${tiendaId}/ordenes`,
      obtenerTicket: pedirTicketWs,
      alCambiarEstado: setEstado,
      alMensaje: (n) => {
        const { titulo, descripcion, tipo } = aviso(n)
        toast.add({ type: tipo, title: titulo, description: descripcion })
        oyentes.current.forEach((oyente) => oyente(n))
      },
    })
    return () => {
      canal.cerrar()
      setEstado("cerrado")
    }
  }, [activo, tiendaId])

  const valor = React.useMemo(() => ({ estado, suscribir }), [estado, suscribir])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

/** Ejecuta `alEvento` con cada evento de órdenes o envíos de la tienda (p. ej. para volver a pedir la lista). */
export function useEventosOrdenes(alEvento: Oyente) {
  const { suscribir } = React.useContext(Contexto)
  const ultimo = React.useRef(alEvento)
  React.useEffect(() => {
    ultimo.current = alEvento
  })
  React.useEffect(() => suscribir((n) => ultimo.current(n)), [suscribir])
}

/** Estado de la conexión en vivo del panel, para el indicador «En vivo / Reconectando…». */
export function useEstadoEnVivo(): EstadoConexion {
  return React.useContext(Contexto).estado
}
