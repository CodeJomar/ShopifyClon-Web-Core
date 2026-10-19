"use client"

import { Coffee, Grid2X2, Wifi, WifiOff } from "lucide-react"

import { cn } from "@/shared/utils/cn"

import type { VistaPos } from "../hooks/use-terminal-pos"

interface PosEncabezadoProps {
  enVivo: boolean
  vistaActiva: VistaPos
  onCambiarVista: (vista: VistaPos) => void
  /** Cantidad de mesas del local; se muestra junto a «Mapa de Mesas» cuando ya cargó. */
  totalMesas: number | null
}

const pestanaClass = (activa: boolean) =>
  cn(
    "inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-xs font-semibold transition-all sm:flex-initial",
    activa
      ? "bg-[#4C0107] text-white shadow-sm dark:bg-stone-100 dark:text-stone-900"
      : "text-slate-600 hover:text-slate-900 dark:text-stone-300 dark:hover:text-white",
  )

/** Título del POS, indicador de conexión en vivo y selector de vista: Catálogo / Mapa de Mesas. */
export function PosEncabezado({ enVivo, vistaActiva, onCambiarVista, totalMesas }: PosEncabezadoProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 sm:inline-flex dark:bg-emerald-500/15 dark:text-emerald-300">
          {enVivo ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {enVivo ? "En vivo" : "Actualización periódica"}
          <h1 className="font-bold tracking-tight">| T. POS</h1>
        </span>
      </div>

      <div className="flex w-full items-center gap-1 rounded-full bg-[#EDE5E6]/60 p-1 sm:w-auto dark:bg-stone-800">
        <button type="button" onClick={() => onCambiarVista("catalogo")} className={pestanaClass(vistaActiva === "catalogo")}>
          <Coffee className="size-3.5 shrink-0" />
          <span>Catálogo</span>
        </button>
        <button type="button" onClick={() => onCambiarVista("mesas")} className={pestanaClass(vistaActiva === "mesas")}>
          <Grid2X2 className="size-3.5 shrink-0" />
          <span>Mapa de Mesas</span>
          {totalMesas !== null && (
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] dark:bg-white/20">{totalMesas}</span>
          )}
        </button>
      </div>
    </div>
  )
}
