"use client"

import * as React from "react"
import { getDashboardResumen } from "../actions/dashboard.actions"
import type { DashboardResumenDto } from "@/dtos/dashboard"
import { DASHBOARD_REFRESH_MS, type PeriodoDashboard } from "../schema"

interface UseDashboardOptions {
  periodoInicial?: PeriodoDashboard
  // Permite pausar la carga (por ejemplo, si el usuario no tiene permiso)
  enabled?: boolean
  intervalMs?: number
}

export function useDashboard({
  periodoInicial = "hoy",
  enabled = true,
  intervalMs = DASHBOARD_REFRESH_MS,
}: UseDashboardOptions = {}) {
  const [periodo, setPeriodo] = React.useState<PeriodoDashboard>(periodoInicial)
  const [data, setData] = React.useState<DashboardResumenDto | null>(null)
  const [actualizadoEn, setActualizadoEn] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  // Solo la última petición puede actualizar el estado (evita respuestas desfasadas)
  const requestIdRef = React.useRef(0)

  const cargar = React.useCallback((p: PeriodoDashboard) => {
    const requestId = ++requestIdRef.current
    const esVigente = () => requestId === requestIdRef.current

    return getDashboardResumen(p)
      .then((respuesta) => {
        if (!esVigente()) return
        if (respuesta.isOk()) {
          setData(respuesta.data)
          setActualizadoEn(new Date().toISOString())
          setError(null)
        } else {
          setError(respuesta.getMessage())
        }
      })
      .catch(() => {
        if (esVigente()) setError("No se pudo cargar el resumen del dashboard.")
      })
      .finally(() => {
        if (!esVigente()) return
        setIsLoading(false)
        setIsRefreshing(false)
      })
  }, [])

  // Carga inicial y al cambiar de periodo
  React.useEffect(() => {
    if (!enabled) return
    void cargar(periodo)
  }, [enabled, periodo, reloadKey, cargar])

  // Refresco en tiempo real: consulta periódica mientras la pestaña está visible
  React.useEffect(() => {
    if (!enabled) return

    const refrescar = () => {
      if (document.visibilityState !== "visible") return
      setIsRefreshing(true)
      void cargar(periodo)
    }

    const timer = window.setInterval(refrescar, intervalMs)
    document.addEventListener("visibilitychange", refrescar)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", refrescar)
    }
  }, [enabled, periodo, intervalMs, cargar])

  const cambiarPeriodo = React.useCallback((nuevo: PeriodoDashboard) => {
    setIsLoading(true)
    setPeriodo(nuevo)
  }, [])

  const recargar = React.useCallback(() => {
    setIsLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  return { periodo, cambiarPeriodo, data, actualizadoEn, isLoading, isRefreshing, error, recargar }
}
