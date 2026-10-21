"use client"

import * as React from "react"

/** Cuenta regresiva en segundos (reenvío de código con espera de 60 s, límite GEN-429 con Retry-After). */
export function useCuentaRegresiva() {
  const [restan, setRestan] = React.useState(0)

  React.useEffect(() => {
    if (restan <= 0) return
    const temporizador = window.setTimeout(() => setRestan((s) => s - 1), 1000)
    return () => window.clearTimeout(temporizador)
  }, [restan])

  return { restan, iniciar: (segundos: number) => setRestan(Math.max(0, Math.ceil(segundos))) }
}
