"use client"

import * as React from "react"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ResumenPropietario } from "@/dtos/administracion"

const ESTADO: Record<string, string> = { ACTIVA: "Activa", ACTIVO: "Activa", EN_PRUEBA: "En prueba", PRUEBA: "En prueba", VENCIDA: "Vencida", CANCELADA: "Cancelada", SUSPENDIDA: "Suspendida" }

/** Aviso para quien ya vende: qué plan tiene cada una de sus tiendas (GET /propietario/resumen). Sin sesión o sin tiendas, no se muestra. */
export function PlanesDeMisTiendas({ nombresPlanes }: { nombresPlanes: Record<string, string> }) {
  const [tiendas, setTiendas] = React.useState<ResumenPropietario["tiendas"] | null>(null)

  React.useEffect(() => {
    let cancelado = false
    void resultado(peticionApi<ResumenPropietario>({ method: "GET", url: "/propietario/resumen", sinRedireccion401: true })).then((res) => {
      if (!cancelado && res.ok) setTiendas(res.datos.tiendas)
    })
    return () => {
      cancelado = true
    }
  }, [])

  if (!tiendas || tiendas.length === 0) return null
  return (
    <section aria-labelledby="mis-planes-titulo" className="vidrio mt-8 rounded-[28px] p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-5 text-brand-text" aria-hidden="true" />
        <h2 id="mis-planes-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Ya vendes en OTemu: estos son tus planes</h2>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiendas.map((t) => (
          <li key={t.tienda_id} className="rounded-2xl bg-secondary px-4 py-3">
            <p className="truncate text-[14.5px] font-extrabold text-foreground">{t.nombre}</p>
            <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">
              Plan <span className="font-bold text-brand-text">{nombresPlanes[t.codigo_plan] ?? t.codigo_plan}</span> · {ESTADO[t.estado_suscripcion] ?? t.estado_suscripcion.toLowerCase()}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[13px] text-muted-foreground">
        Cambia el plan de una tienda desde su panel, en <Link href="/cuenta/tiendas" className="font-bold text-brand-text hover:underline">Mis tiendas</Link> → Suscripción.
      </p>
    </section>
  )
}
