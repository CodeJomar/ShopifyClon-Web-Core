"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { CampanaActivaDto } from "@/dtos/campanas"

/** Franja con la campaña vigente (GET /campanas/activa). Si no hay campaña, o la consulta falla, no se muestra nada. */
export function BannerCampana() {
  const [campana, setCampana] = React.useState<CampanaActivaDto | null>(null)

  React.useEffect(() => {
    let cancelado = false
    void resultado(peticionApi<CampanaActivaDto>({ method: "GET", url: "/campanas/activa", sinRedireccion401: true })).then((res) => {
      if (!cancelado && res.ok && res.datos.activa) setCampana(res.datos)
    })
    return () => {
      cancelado = true
    }
  }, [])

  if (!campana) return null
  const porcentajes = campana.tramos.map((t) => t.porcentaje)
  const min = Math.min(...porcentajes)
  const max = Math.max(...porcentajes)
  return (
    <div role="status" className="relative z-10 mx-auto mt-24 flex w-[min(100%-2rem,72rem)] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border border-primary/50 bg-primary/12 px-4 py-2.5 text-center text-[13.5px] font-bold text-foreground">
      <Sparkles className="size-4 text-brand-text" aria-hidden="true" />
      <span className="font-extrabold text-brand-text">{campana.nombre}</span>
      <span>
        Descuento automático de {min} % a {max} % según el precio del producto. Ya está aplicado en los precios que ves.
      </span>
    </div>
  )
}
