"use client"

import * as React from "react"

/**
 * Hora actual en milisegundos, refrescada cada `intervaloMs`. Sirve para mostrar tiempos transcurridos ("hace 5 min")
 * que se mantienen al día sin volver a pedir datos al servidor.
 */
export function useAhora(intervaloMs = 30_000): number {
  const [ahora, setAhora] = React.useState(() => Date.now())

  React.useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])

  return ahora
}
