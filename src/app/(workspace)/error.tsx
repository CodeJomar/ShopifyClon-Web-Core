"use client"

import { useEffect } from "react"

import { ErrorView } from "@/modules/errors"

/** Límite de error del workspace: el fallo de una pantalla se muestra dentro del contenido, sin perder el menú. */
export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorView error={error} onReintentar={reset} rutaInicio="/home" embebido />
}
