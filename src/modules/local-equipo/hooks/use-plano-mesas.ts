"use client"

import * as React from "react"

import { toastResponse } from "@/shared/utils/toast-response"

import { actualizarMesa, crearMesa, eliminarMesa, getMesas, renombrarArea } from "../actions/local-equipo.actions"
import { FILTRO_TODAS_LAS_AREAS, areaDeMesa, areasDeMesas, type Mesa, type MesaFormValues } from "../schema"

/* -------------------------------------------------------------------------- */
/*                    Configuración del plano de mesas                        */
/* -------------------------------------------------------------------------- */

const REFRESCO_MESAS_MS = 30_000

export function usePlanoMesas() {
  const [mesas, setMesas] = React.useState<Mesa[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [areaFiltro, setAreaFiltro] = React.useState<string>(FILTRO_TODAS_LAS_AREAS)

  React.useEffect(() => {
    let vigente = true

    getMesas()
      .then((respuesta) => {
        if (!vigente) return
        if (respuesta.isOk()) {
          setMesas(respuesta.data ?? [])
          setError(null)
        } else {
          setError(respuesta.getMessage())
        }
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar el plano de mesas.")
      })
      .finally(() => {
        if (vigente) setIsLoading(false)
      })

    return () => {
      vigente = false
    }
  }, [reloadKey])

  // El estado de las mesas lo mueve la operación (POS): se mantiene al día sin tocar nada
  React.useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === "visible") setReloadKey((k) => k + 1)
    }
    const timer = window.setInterval(refrescar, REFRESCO_MESAS_MS)
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

  // Las áreas salen de las mesas (texto libre que administra el propietario)
  const areas = React.useMemo(() => areasDeMesas(mesas), [mesas])

  // Si el área filtrada ya no existe (se quedó sin mesas), se vuelve a mostrar todo el plano
  const areaActiva = areaFiltro !== FILTRO_TODAS_LAS_AREAS && areas.includes(areaFiltro) ? areaFiltro : FILTRO_TODAS_LAS_AREAS

  const mesasFiltradas = React.useMemo(
    () =>
      mesas
        .filter((m) => areaActiva === FILTRO_TODAS_LAS_AREAS || areaDeMesa(m) === areaActiva)
        .sort((a, b) => a.numero.localeCompare(b.numero, "es", { numeric: true })),
    [mesas, areaActiva],
  )

  const mesasPorArea = React.useMemo(() => {
    const mapa = new Map<string, number>()
    for (const m of mesas) mapa.set(areaDeMesa(m), (mapa.get(areaDeMesa(m)) ?? 0) + 1)
    return mapa
  }, [mesas])

  const resumen = React.useMemo(
    () => ({
      mesas: mesasFiltradas.length,
      capacidad: mesasFiltradas.reduce((acc, m) => acc + m.capacidad, 0),
    }),
    [mesasFiltradas],
  )

  const guardarMesa = React.useCallback(
    async (values: MesaFormValues, mesa?: Mesa): Promise<boolean> => {
      const base = { numero: values.numero.trim(), area: values.area.trim(), capacidad: Number(values.capacidad) }
      const respuesta = await toastResponse(mesa ? actualizarMesa(mesa.id_mesa, base) : crearMesa(base), {
        loading: mesa ? "Guardando la mesa…" : "Registrando la mesa…",
        success: mesa ? `"${base.numero}" actualizada` : `"${base.numero}" registrada en el plano`,
        error: mesa ? "No se pudo guardar la mesa" : "No se pudo registrar la mesa",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  const quitarMesa = React.useCallback(
    async (mesa: Mesa): Promise<boolean> => {
      const respuesta = await toastResponse(eliminarMesa(mesa.id_mesa), {
        loading: "Eliminando la mesa…",
        success: `"${mesa.numero}" eliminada del plano`,
        error: "No se pudo eliminar la mesa",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  /** Cambia el nombre de un área en todas sus mesas. */
  const cambiarNombreArea = React.useCallback(
    async (actual: string, nuevo: string): Promise<boolean> => {
      const respuesta = await toastResponse(renombrarArea({ actual, nuevo }), {
        loading: "Renombrando el área…",
        success: `Área renombrada a "${nuevo}"`,
        error: "No se pudo renombrar el área",
      })
      if (respuesta.isOk()) {
        // Si se estaba filtrando por esa área, el filtro la sigue
        setAreaFiltro((prev) => (prev === actual ? nuevo : prev))
        refrescar()
      }
      return respuesta.isOk()
    },
    [refrescar],
  )

  return {
    mesas,
    areas,
    mesasFiltradas,
    mesasPorArea,
    resumen,
    isLoading,
    error,
    recargar,
    areaFiltro: areaActiva,
    setAreaFiltro,
    guardarMesa,
    quitarMesa,
    cambiarNombreArea,
  }
}
