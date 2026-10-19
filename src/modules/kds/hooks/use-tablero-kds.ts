"use client"

import * as React from "react"
import type { OneQuery } from "@/dtos/core/oneQuery.dto"
import type { ItemEstadoCambiadoDto, TarjetaKdsDto } from "@/dtos/kds"
import type { EstadoItemKds } from "@/dtos/pedidos"
import { conectarTiempoReal } from "@/lib/realtime/kds-socket"
import { toastResponse } from "@/shared/utils/toast-response"
import { cambiarEstadoItemKds, getTableroKds } from "../actions/kds.actions"
import { ESTADOS_COLA_KDS, SONDEO_TABLERO_MS, type EstadoColaKds, type FiltroEstadoKds } from "../schema"
import { aplicarComandaEstado, aplicarItemActualizado, aplicarNuevaComanda, ordenarTablero } from "../utils"

/* -------------------------------------------------------------------------- */
/*                            Hook principal del KDS                           */
/* -------------------------------------------------------------------------- */

/**
 * Tablero de cocina y barra. Se mantiene al día de tres formas, de la más inmediata a la más segura:
 * eventos por WebSocket, sondeo cada pocos segundos y recarga al volver a la pestaña.
 */
export function useTableroKds() {
  const [tarjetas, setTarjetas] = React.useState<TarjetaKdsDto[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filtro, setFiltro] = React.useState<FiltroEstadoKds>("todas")
  const [enVivo, setEnVivo] = React.useState(false)
  // Productos con una petición en curso (se deshabilitan sus botones para evitar doble toque).
  const [procesando, setProcesando] = React.useState<ReadonlySet<string>>(new Set())

  // `silencioso`: recargas de fondo; un fallo de red momentáneo no reemplaza el tablero por un error.
  const cargar = React.useCallback(
    (silencioso = false) =>
      getTableroKds().then((res) => {
        if (res.isOk()) {
          setTarjetas(ordenarTablero(res.data ?? []))
          setError(null)
        } else if (!silencioso) {
          setError(res.getMessage())
        }
        setIsLoading(false)
      }),
    [],
  )

  const recargar = React.useCallback(() => {
    setIsLoading(true)
    void cargar()
  }, [cargar])

  React.useEffect(() => {
    void cargar()
    const sondeo = setInterval(() => void cargar(true), SONDEO_TABLERO_MS)
    const alVolver = () => {
      if (document.visibilityState === "visible") void cargar(true)
    }
    document.addEventListener("visibilitychange", alVolver)
    return () => {
      clearInterval(sondeo)
      document.removeEventListener("visibilitychange", alVolver)
    }
  }, [cargar])

  React.useEffect(() => {
    const cerrar = conectarTiempoReal({
      onNuevaComanda: (tarjeta) => setTarjetas((prev) => aplicarNuevaComanda(prev, tarjeta)),
      onComandaEstado: (evento) => {
        setTarjetas((prev) => aplicarComandaEstado(prev, evento))
        // Un pedido que vuelve a la cola sin tarjeta conocida (otro terminal lo reabrió): se resincroniza el tablero.
        void cargar(true)
      },
      onItemActualizado: (evento) => setTarjetas((prev) => aplicarItemActualizado(prev, evento)),
      onConexion: setEnVivo,
    })
    return () => {
      cerrar?.()
    }
  }, [cargar])

  const marcarProcesando = React.useCallback((ids: string[], activo: boolean) => {
    setProcesando((prev) => {
      const siguiente = new Set(prev)
      for (const id of ids) {
        if (activo) siguiente.add(id)
        else siguiente.delete(id)
      }
      return siguiente
    })
  }, [])

  /** Cambia el estado de un producto. Devuelve true si la API lo aceptó. */
  const cambiarItem = React.useCallback(
    async (idItem: string, estado: EstadoItemKds): Promise<boolean> => {
      marcarProcesando([idItem], true)
      const res = await toastResponse(cambiarEstadoItemKds(idItem, estado), {
        loading: "Actualizando producto...",
        success: estado === "despachado" ? "Producto listo" : estado === "preparando" ? "Producto en preparación" : "Producto devuelto a la cola",
        error: "No se pudo actualizar el producto",
      })
      marcarProcesando([idItem], false)

      if (res.isOk()) {
        setTarjetas((prev) =>
          aplicarItemActualizado(prev, {
            id_pedido: res.data.id_pedido,
            id_pedido_detalle: idItem,
            estado_kds: estado,
            completado: estado === "despachado",
            estado_pedido: res.data.estado_pedido,
          }),
        )
        return true
      }
      // 409 típico: otro terminal ya movió el pedido. Se resincroniza para mostrar la realidad.
      void cargar(true)
      return false
    },
    [cargar, marcarProcesando],
  )

  /** Despacha, uno a uno, los productos que faltan de un pedido (la API pasa el pedido a "listo" con el último). */
  const marcarTodoListo = React.useCallback(
    async (tarjeta: TarjetaKdsDto): Promise<boolean> => {
      const pendientes = tarjeta.items.filter((i) => i.estado_kds !== "despachado")
      if (pendientes.length === 0) return true
      const ids = pendientes.map((i) => i.id_pedido_detalle)
      marcarProcesando(ids, true)

      const secuencia = async (): Promise<OneQuery<ItemEstadoCambiadoDto>> => {
        let ultima: OneQuery<ItemEstadoCambiadoDto> | undefined
        for (const id of ids) {
          ultima = await cambiarEstadoItemKds(id, "despachado")
          if (!ultima.isOk()) return ultima
        }
        return ultima as OneQuery<ItemEstadoCambiadoDto>
      }

      const res = await toastResponse(secuencia(), {
        loading: "Marcando pedido como listo...",
        success: "Pedido listo",
        error: "No se pudo completar el pedido",
      })
      marcarProcesando(ids, false)
      void cargar(true)
      return res.isOk()
    },
    [cargar, marcarProcesando],
  )

  const tarjetasFiltradas = React.useMemo(
    () => (filtro === "todas" ? tarjetas : tarjetas.filter((t) => t.estado === filtro)),
    [tarjetas, filtro],
  )

  const contadores = React.useMemo(() => {
    const mapa: Record<FiltroEstadoKds, number> = { todas: tarjetas.length, pendiente: 0, en_preparacion: 0 }
    for (const t of tarjetas) {
      if ((ESTADOS_COLA_KDS as readonly string[]).includes(t.estado)) mapa[t.estado as EstadoColaKds]++
    }
    return mapa
  }, [tarjetas])

  return {
    tarjetas: tarjetasFiltradas,
    todas: tarjetas,
    isLoading,
    error,
    enVivo,
    recargar,
    filtro,
    setFiltro,
    contadores,
    procesando,
    cambiarItem,
    marcarTodoListo,
  }
}
