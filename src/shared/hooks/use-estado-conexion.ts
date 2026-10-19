"use client"

import * as React from "react"

import { conexion, probarApi, type EstadoConexion } from "@/lib/connection"

/** Estado actual de la conexión (sin internet / API caída), siempre al día. */
export function useEstadoConexion(): EstadoConexion {
  return React.useSyncExternalStore(conexion.suscribir, conexion.leer, conexion.leerServidor)
}

const INTERVALO_REINTENTO_MS = 5000

/**
 * Vigila la conexión mientras la app está abierta (montar UNA vez, en el layout raíz):
 *  - escucha los eventos online/offline del navegador;
 *  - cuando hay un problema, pregunta cada pocos segundos si la API volvió y quita el aviso al recuperarse.
 * Devuelve `reintentar` para el botón "Reintentar ahora" y `reconectado` (true un instante tras recuperarse).
 */
export function useVigilanciaConexion() {
  const estado = useEstadoConexion()
  const hayProblema = estado.sinInternet || estado.apiCaida
  const [reintentando, setReintentando] = React.useState(false)
  const huboProblema = React.useRef(false)
  const [reconectado, setReconectado] = React.useState(false)

  // Eventos del navegador: el aviso de "sin internet" aparece y desaparece solo.
  React.useEffect(() => {
    const alPerderRed = () => conexion.marcarSinInternet()
    const alVolverRed = () => conexion.marcarConInternet()
    if (!navigator.onLine) conexion.marcarSinInternet()
    window.addEventListener("offline", alPerderRed)
    window.addEventListener("online", alVolverRed)
    return () => {
      window.removeEventListener("offline", alPerderRed)
      window.removeEventListener("online", alVolverRed)
    }
  }, [])

  const reintentar = React.useCallback(async () => {
    setReintentando(true)
    if (navigator.onLine) conexion.marcarConInternet()
    const viva = navigator.onLine && (await probarApi())
    if (viva) conexion.marcarApiOperativa()
    setReintentando(false)
    return viva
  }, [])

  // Mientras haya problema, se reintenta solo.
  React.useEffect(() => {
    if (!hayProblema) return
    const temporizador = window.setInterval(() => void reintentar(), INTERVALO_REINTENTO_MS)
    return () => window.clearInterval(temporizador)
  }, [hayProblema, reintentar])

  // Avisa un momento cuando todo vuelve a la normalidad.
  React.useEffect(() => {
    if (hayProblema) {
      huboProblema.current = true
      return
    }
    if (!huboProblema.current) return
    huboProblema.current = false
    const mostrar = window.setTimeout(() => setReconectado(true), 0)
    const ocultar = window.setTimeout(() => setReconectado(false), 3500)
    return () => {
      window.clearTimeout(mostrar)
      window.clearTimeout(ocultar)
    }
  }, [hayProblema])

  return { estado, hayProblema, reintentando, reintentar, reconectado }
}
