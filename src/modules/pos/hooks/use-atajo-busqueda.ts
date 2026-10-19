"use client"

import * as React from "react"

/**
 * Atajo "/" para enfocar el buscador desde cualquier parte de la pantalla (si no se está escribiendo en otro campo).
 * Devuelve la referencia que hay que poner en el input; `alActivar` permite, por ejemplo, volver a la vista del catálogo.
 */
export function useAtajoBusqueda(alActivar?: () => void) {
  const busquedaRef = React.useRef<HTMLInputElement>(null)
  // La última versión del callback, sin volver a registrar el listener cada vez que cambia
  const alActivarRef = React.useRef(alActivar)
  React.useEffect(() => {
    alActivarRef.current = alActivar
  })

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const objetivo = e.target as HTMLElement | null
      const escribiendo = objetivo?.closest("input, textarea, select, [contenteditable='true']")
      if (e.key === "/" && !escribiendo) {
        e.preventDefault()
        alActivarRef.current?.()
        busquedaRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return busquedaRef
}
