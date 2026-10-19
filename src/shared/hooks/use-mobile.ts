"use client"

import * as React from "react"

// El menú lateral es un cajón (oculto, se abre con el botón del encabezado) hasta 1024 px inclusive; desde 1025 px es fijo.
const TABLET_BREAKPOINT = 1025
const CONSULTA = `(max-width: ${TABLET_BREAKPOINT - 1}px)`

function suscribir(alCambiar: () => void) {
  const mql = window.matchMedia(CONSULTA)
  mql.addEventListener("change", alCambiar)
  return () => mql.removeEventListener("change", alCambiar)
}

/** true en pantallas de hasta 1024 px (tablet y laptop pequeña). En el servidor es false. */
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  )
}
