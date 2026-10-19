"use client"

import * as React from "react"
import type { AperturaTurnoPayload, CierreTurnoPayload, MovimientoCajaPayload, MovimientoHistorialDto, TurnoActualDto, TurnoListadoDto } from "@/dtos/caja"
import { toastResponse } from "@/shared/utils/toast-response"
import { abrirTurno, cerrarTurno, getHistorialCaja, getTurnoActual, getTurnos, registrarMovimiento } from "../actions/transacciones.actions"
import { REFRESCO_CAJA_MS, TURNOS_ANTERIORES, resumirTurno } from "../schema"

/* -------------------------------------------------------------------------- */
/*                     Turno de caja (apertura, movimientos, cierre)          */
/* -------------------------------------------------------------------------- */

export function useTurnoCaja() {
  const [actual, setActual] = React.useState<TurnoActualDto | null>(null)
  const [historial, setHistorial] = React.useState<MovimientoHistorialDto[]>([])
  const [turnos, setTurnos] = React.useState<TurnoListadoDto[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    let vigente = true
    Promise.all([getTurnoActual(), getHistorialCaja(), getTurnos(1, TURNOS_ANTERIORES)])
      .then(([turno, movimientos, listaTurnos]) => {
        if (!vigente) return
        // 404 = caja cerrada: es un estado normal, no un error
        if (turno.isOk()) setActual(turno.data ?? null)
        else if (turno.httpStatusCode === 404) setActual(null)
        else {
          setError(turno.getMessage())
          return
        }
        setHistorial(movimientos.isOk() ? (movimientos.data ?? []) : [])
        setTurnos(listaTurnos.isOk() ? listaTurnos.data : [])
        setError(null)
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar la información de caja.")
      })
      .finally(() => {
        if (vigente) setIsLoading(false)
      })
    return () => {
      vigente = false
    }
  }, [reloadKey])

  // La caja se actualiza sola mientras la pestaña está visible (cobros hechos desde el POS, por ejemplo)
  React.useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === "visible") setReloadKey((k) => k + 1)
    }
    const timer = window.setInterval(refrescar, REFRESCO_CAJA_MS)
    document.addEventListener("visibilitychange", refrescar)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", refrescar)
    }
  }, [])

  const recargar = React.useCallback(() => {
    setIsLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  const refrescar = React.useCallback(() => setReloadKey((k) => k + 1), [])

  const idTurno = actual?.turno.id_turno_caja ?? null
  const resumen = React.useMemo(() => (actual ? resumirTurno(actual) : null), [actual])
  const movimientos = React.useMemo(
    () =>
      historial
        .filter((m) => m.id_turno_caja === idTurno)
        .sort((a, b) => b.fecha_creacion.localeCompare(a.fecha_creacion)),
    [historial, idTurno],
  )
  // Turnos anteriores: los que ya no están abiertos, tal como los entrega la API
  const archivados = React.useMemo(() => turnos.filter((t) => t.id_turno_caja !== idTurno), [turnos, idTurno])

  const abrir = React.useCallback(
    async (payload: AperturaTurnoPayload) => {
      const respuesta = await toastResponse(abrirTurno(payload), {
        loading: "Abriendo la caja…",
        success: "Caja abierta",
        error: "No se pudo abrir la caja",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta
    },
    [refrescar],
  )

  const registrar = React.useCallback(
    async (payload: MovimientoCajaPayload) => {
      const respuesta = await toastResponse(registrarMovimiento(payload), {
        loading: "Registrando el movimiento…",
        success: "Movimiento registrado",
        error: "No se pudo registrar el movimiento",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta
    },
    [refrescar],
  )

  const cerrar = React.useCallback(
    async (payload: CierreTurnoPayload) => {
      if (!idTurno) return null
      const respuesta = await toastResponse(cerrarTurno(idTurno, payload), {
        loading: "Cerrando la caja…",
        success: (r) => (r.data?.estado === "descuadre" ? "Caja cerrada con descuadre" : "Caja cerrada"),
        error: "No se pudo cerrar la caja",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta
    },
    [idTurno, refrescar],
  )

  return { actual, resumen, movimientos, archivados, isLoading, error, recargar, refrescar, abrir, registrar, cerrar }
}
