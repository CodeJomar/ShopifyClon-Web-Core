"use client"

import * as React from "react"

import type { AvisoSesionDto } from "@/dtos/auth"
import { actividadAction } from "../actions/auth.actions"

/** Entradas del usuario que cuentan como actividad. Las consultas automáticas de las pantallas no cuentan. */
const EVENTOS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const
/** Cada cuánto, como máximo, se avisa a la API de que el usuario sigue activo. */
const LATIDO_MS = 30_000
const REVISION_MS = 1_000
/** Cuánto antes de cerrar la sesión se avisa a la persona. */
const AVISO_PREVIO_MS = 10_000

export interface OpcionesInactividad {
  /** La sesión se cerró por inactividad. */
  alExpirar: () => void
  /** Hay avisos de la cuenta que mostrar (por ejemplo, un intento de inicio de sesión ajeno). */
  alAvisar?: (avisos: AvisoSesionDto[]) => void
  /** Quedan unos segundos de sesión sin actividad. Puede devolver una función que retira el aviso si la persona vuelve a actuar. */
  alPorExpirar?: () => (() => void) | void
}

/**
 * Cierra la sesión por inactividad: si el usuario no hace clic, no teclea ni toca la pantalla durante `limiteSegundos`,
 * llama a `alExpirar` (y 10 segundos antes llama a `alPorExpirar`). Mientras hay actividad envía un latido a la API
 * (POST /auth/actividad) para que su sesión no venza; la API es la que manda: aunque esta pantalla fallara, rechaza la
 * sesión inactiva. El latido es "de borde final": si la actividad cae dentro del intervalo, se envía al terminar este,
 * de modo que el reloj de la API nunca se adelanta al de la pantalla.
 */
export function useInactividad(limiteSegundos: number | undefined, opciones: OpcionesInactividad): void {
  const opcionesRef = React.useRef(opciones)
  React.useEffect(() => {
    opcionesRef.current = opciones
  }, [opciones])

  React.useEffect(() => {
    if (!limiteSegundos) return
    const limiteMs = limiteSegundos * 1000
    // El latido nunca es más espaciado que un tercio del límite (con 5 min son 30 s; con límites cortos, más seguido).
    const latidoMs = Math.min(LATIDO_MS, limiteMs / 3)
    const avisoMs = limiteMs > AVISO_PREVIO_MS ? limiteMs - AVISO_PREVIO_MS : null
    let ultimaActividad = Date.now()
    let ultimoLatido = Date.now()
    let expirada = false
    let avisada = false
    let retirarAviso: (() => void) | undefined
    let temporizadorLatido: ReturnType<typeof setTimeout> | undefined

    const retirar = () => {
      avisada = false
      retirarAviso?.()
      retirarAviso = undefined
    }

    const enviarLatido = () => {
      temporizadorLatido = undefined
      if (expirada) return
      ultimoLatido = Date.now()
      // El latido también trae los avisos pendientes de la cuenta.
      void actividadAction().then((r) => {
        if (r.isOk() && r.data?.avisos?.length) opcionesRef.current.alAvisar?.(r.data.avisos)
      })
    }

    const revisar = () => {
      if (expirada) return
      const inactivo = Date.now() - ultimaActividad
      if (inactivo >= limiteMs) {
        expirada = true
        retirar()
        clearTimeout(temporizadorLatido)
        opcionesRef.current.alExpirar()
        return
      }
      if (avisoMs !== null && !avisada && inactivo >= avisoMs) {
        avisada = true
        retirarAviso = opcionesRef.current.alPorExpirar?.() ?? undefined
      }
    }

    const alActuar = () => {
      if (expirada) return
      // Volver tras superar el límite no revive la sesión: se revisa antes de contar la nueva actividad.
      if (Date.now() - ultimaActividad >= limiteMs) return revisar()
      const ahora = Date.now()
      ultimaActividad = ahora
      if (avisada) retirar()
      if (ahora - ultimoLatido > latidoMs) {
        clearTimeout(temporizadorLatido)
        enviarLatido()
      } else if (temporizadorLatido === undefined) {
        temporizadorLatido = setTimeout(enviarLatido, latidoMs - (ahora - ultimoLatido) + 50)
      }
    }

    const alVolver = () => {
      if (document.visibilityState === "visible") revisar()
    }

    for (const evento of EVENTOS) window.addEventListener(evento, alActuar, { passive: true, capture: true })
    document.addEventListener("visibilitychange", alVolver)
    const intervalo = setInterval(revisar, REVISION_MS)
    return () => {
      for (const evento of EVENTOS) window.removeEventListener(evento, alActuar, { capture: true })
      document.removeEventListener("visibilitychange", alVolver)
      clearInterval(intervalo)
      clearTimeout(temporizadorLatido)
      retirar()
    }
  }, [limiteSegundos])
}
