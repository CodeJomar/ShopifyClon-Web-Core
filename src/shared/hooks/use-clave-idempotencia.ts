"use client"

import * as React from "react"

/** UUID v4 con guiones: la API exige un UUID en `Idempotency-Key` (CHK-007). */
export function crearClaveIdempotencia(): string {
  return crypto.randomUUID()
}

/**
 * Clave `Idempotency-Key` para operaciones con dinero o pedidos. Una misma clave se reutiliza mientras el contenido
 * de la operación NO cambie: si el usuario toca dos veces o la red falla y reintenta, el servidor reconoce la
 * repetición y no duplica el pedido ni el cobro. Si el contenido cambia, nace una clave nueva (la API rechazaría
 * la misma clave con otro contenido) y tras un éxito se reinicia con `reiniciar()`.
 */
export function useClaveIdempotencia() {
  const actual = React.useRef<{ clave: string; huella: string } | null>(null)

  const obtener = React.useCallback((huella: string): string => {
    if (!actual.current || actual.current.huella !== huella) {
      actual.current = { clave: crearClaveIdempotencia(), huella }
    }
    return actual.current.clave
  }, [])

  const reiniciar = React.useCallback(() => {
    actual.current = null
  }, [])

  return { obtener, reiniciar }
}
