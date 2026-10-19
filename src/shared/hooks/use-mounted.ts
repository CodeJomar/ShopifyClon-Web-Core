"use client"

import * as React from "react"

const sinSuscripcion = () => () => {}

/**
 * true cuando el componente ya se montó en el navegador (false en el servidor y en la primera hidratación).
 * Sirve para valores que solo existen en el cliente (tema, tamaño de pantalla) sin un `setState` dentro de un efecto.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(sinSuscripcion, () => true, () => false)
}
