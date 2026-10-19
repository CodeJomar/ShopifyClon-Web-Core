"use client"

import * as React from "react"
import type { PedidoListadoDto } from "@/dtos/pedidos"
import { rangoUltimosDias } from "@/shared/utils/fechas"
import { aCentimos } from "@/shared/utils/dinero"
import { getPedidos } from "../actions/transacciones.actions"
import { DIAS_PERIODO_PEDIDOS, LIMITE_PEDIDOS, grupoDePedido, type FiltroGrupoPedido, type PeriodoPedidos } from "../schema"

// Espera a que se deje de escribir antes de buscar en el servidor
const ESPERA_BUSQUEDA_MS = 350

/* -------------------------------------------------------------------------- */
/*                        Historial de pedidos y comprobantes                 */
/* -------------------------------------------------------------------------- */

export function useHistorialPedidos() {
  const [pedidos, setPedidos] = React.useState<PedidoListadoDto[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [periodo, setPeriodoState] = React.useState<PeriodoPedidos>("hoy")
  const [busqueda, setBusqueda] = React.useState("")
  const [busquedaEnviada, setBusquedaEnviada] = React.useState("")
  const [grupo, setGrupo] = React.useState<FiltroGrupoPedido>("todos")

  // La búsqueda se hace en la API (cliente, mesa, #número); se envía cuando el usuario deja de escribir
  React.useEffect(() => {
    const temporizador = window.setTimeout(() => setBusquedaEnviada(busqueda.trim()), ESPERA_BUSQUEDA_MS)
    return () => window.clearTimeout(temporizador)
  }, [busqueda])

  React.useEffect(() => {
    let vigente = true
    const dias = DIAS_PERIODO_PEDIDOS[periodo]
    getPedidos({ limite: LIMITE_PEDIDOS, ...(busquedaEnviada ? { busqueda: busquedaEnviada } : {}), ...(dias > 1 ? rangoUltimosDias(dias) : {}) })
      .then((respuesta) => {
        if (!vigente) return
        if (respuesta.isOk()) {
          setPedidos(respuesta.data)
          setError(null)
        } else {
          setError(respuesta.getMessage())
        }
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar el historial de pedidos.")
      })
      .finally(() => {
        if (vigente) setIsLoading(false)
      })
    return () => {
      vigente = false
    }
  }, [periodo, busquedaEnviada, reloadKey])

  const recargar = React.useCallback(() => {
    setIsLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  const setPeriodo = React.useCallback((nuevo: PeriodoPedidos) => {
    setIsLoading(true)
    setPeriodoState(nuevo)
  }, [])

  // El estado se filtra en pantalla sobre lo que ya devolvió la API
  const pedidosFiltrados = React.useMemo(
    () => pedidos.filter((p) => grupo === "todos" || grupoDePedido(p.estado) === grupo),
    [pedidos, grupo],
  )

  const conteo = React.useMemo(() => {
    const base = { activo: 0, pagado: 0, anulado: 0 }
    for (const p of pedidos) base[grupoDePedido(p.estado)] += 1
    return base
  }, [pedidos])

  const cobradoCentimos = React.useMemo(() => pedidos.reduce((acc, p) => acc + aCentimos(p.total_pagado), 0), [pedidos])
  const porCobrarCentimos = React.useMemo(
    () => pedidos.filter((p) => p.estado !== "anulado").reduce((acc, p) => acc + aCentimos(p.saldo_pendiente), 0),
    [pedidos],
  )

  return {
    pedidos,
    pedidosFiltrados,
    conteo,
    cobradoCentimos,
    porCobrarCentimos,
    periodo,
    setPeriodo,
    busqueda,
    setBusqueda,
    grupo,
    setGrupo,
    isLoading,
    error,
    recargar,
  }
}
