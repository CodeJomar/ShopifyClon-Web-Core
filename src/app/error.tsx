"use client"

import { useEffect } from "react"

import { ErrorView } from "@/modules/errors"

/** Límite de error de toda la app (fuera del workspace: login, activación…). */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorView error={error} onReintentar={reset} />
}
