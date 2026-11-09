"use client"

import * as React from "react"
import { Check, CircleAlert, PackagePlus, RotateCcw, Truck } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatearFecha } from "@/shared/utils/fechas"
import { cn } from "@/shared/utils/cn"
import type { EstadoEventoEnvio, EventoEnvio } from "@/dtos/ruta"
import { ETIQUETA_EVENTO } from "../etiquetas"

const ICONO: Record<EstadoEventoEnvio, React.ComponentType<{ className?: string }>> = {
  CREADO: PackagePlus,
  EN_TRANSITO: Truck,
  ENTREGADO: Check,
  NO_ENTREGADO: CircleAlert,
  DEVUELTO: RotateCcw,
}

/** Historial del envío, del más reciente al más antiguo. `eventos` en `null` = cargando. */
export function LineaTiempoEnvio({ eventos, zonaHoraria }: { eventos: EventoEnvio[] | null; zonaHoraria?: string }) {
  if (!eventos) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Cargando el historial">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
    )
  }
  if (eventos.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Este envío todavía no tiene movimientos registrados.</p>
  }
  return (
    <ol className="space-y-0" aria-label="Historial del envío">
      {eventos.map((e, i) => {
        const Icono = ICONO[e.estado]
        const actual = i === 0
        return (
          <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < eventos.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                actual ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
              )}
            >
              <Icono className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="estado" tono={ETIQUETA_EVENTO[e.estado].tono}>{ETIQUETA_EVENTO[e.estado].texto}</Badge>
                <span className="text-[12px] text-muted-foreground">{formatearFecha(e.fecha_evento, zonaHoraria)}</span>
              </div>
              {e.nota && <p className="mt-1 text-[13px] text-foreground">{e.nota}</p>}
              {e.foto_url && (
                <a href={e.foto_url} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- foto de entrega de un bucket externo, tamaño libre */}
                  <img src={e.foto_url} alt="Foto de la entrega" className="h-24 w-auto rounded-lg border border-border object-cover" />
                </a>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
