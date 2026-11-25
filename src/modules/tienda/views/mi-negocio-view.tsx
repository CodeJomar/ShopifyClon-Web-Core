"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { fijarTiendaAction, misTiendasAction } from "../actions/tienda.actions"

/**
 * «Mi negocio»: atajo desde la administración hacia las tiendas propias. Con varias tiendas lleva al panel general del propietario; con
 * una sola la deja como tienda activa y abre su dashboard; sin tiendas lleva a crear la primera.
 */
export function MiNegocioView() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelado = false
    void (async () => {
      const mis = await misTiendasAction()
      if (cancelado) return
      if (!mis.ok) return setError(mis.error.message)
      if (mis.datos.length === 0) return router.replace("/cuenta/tiendas/nueva")
      if (mis.datos.length > 1) return router.replace("/propietario")
      const fijada = await fijarTiendaAction(mis.datos[0].tienda_id)
      if (cancelado) return
      if (!fijada.ok) return setError(fijada.error.message)
      router.replace("/panel")
    })()
    return () => {
      cancelado = true
    }
  }, [router])

  return (
    <p className="py-10 text-[14px] font-semibold text-muted-foreground" aria-live="polite">
      {error ?? "Abriendo tu negocio…"}
    </p>
  )
}
