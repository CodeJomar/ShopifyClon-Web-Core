"use client"

import { Clock, Sparkles } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { formatearDinero } from "@/shared/utils/dinero"
import { areaDeMesa, type MesaPos } from "../schema"
import { ESTADO_MESA_CONFIG, getAreaConfig } from "@/shared/utils/mesa-visual"

export function MesaCard({
  mesa,
  seleccionada,
  ahora,
  puedeLiberar,
  onSeleccionar,
  onLiberar,
}: {
  mesa: MesaPos
  seleccionada: boolean
  ahora: number
  puedeLiberar: boolean
  onSeleccionar: (mesa: MesaPos) => void
  onLiberar: (idMesa: string) => Promise<boolean>
}) {
  const estadoConf = ESTADO_MESA_CONFIG[mesa.estado]
  const areaConfig = getAreaConfig(areaDeMesa(mesa))
  const pedido = mesa.pedido_activo
  const minutos = pedido ? Math.max(0, Math.floor((ahora - new Date(pedido.fecha_apertura).getTime()) / 60_000)) : null

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all",
        "bg-white dark:bg-stone-900 shadow-xs hover:shadow-md",
        estadoConf.border,
        estadoConf.bg,
        seleccionada && "ring-2 ring-[#4C0107] dark:ring-[#E7B7BC] border-transparent",
      )}
    >
      <button type="button" onClick={() => onSeleccionar(mesa)} className="flex flex-col gap-2 text-left cursor-pointer">
        <div className="flex items-start justify-between gap-1">
          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-stone-100">Mesa {mesa.numero}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap", estadoConf.badge)}>
            {estadoConf.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-stone-400">
          <areaConfig.icon className="size-3.5" />
          <span>{areaDeMesa(mesa)}</span>
          <span>·</span>
          <span>{mesa.capacidad} p.</span>
        </div>

        {pedido && minutos !== null && (
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[11px] dark:border-stone-800">
            <span className="font-semibold tabular-nums text-slate-700 dark:text-stone-200">
              {formatearDinero(pedido.total)}
              {mesa.pedidos_activos > 1 && <span className="font-normal text-slate-500 dark:text-stone-400"> · {mesa.pedidos_activos} pedidos</span>}
            </span>
            <span className="flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-medium shrink-0">
              <Clock className="size-3" />
              {minutos} min
            </span>
          </div>
        )}
      </button>

      {mesa.estado === "por_limpiar" && puedeLiberar && (
        <button
          type="button"
          onClick={() => void onLiberar(mesa.id_mesa)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-sky-700 cursor-pointer dark:bg-sky-500 dark:text-stone-950 dark:hover:bg-sky-400"
        >
          <Sparkles className="size-3.5" />
          Marcar lista
        </button>
      )}
    </div>
  )
}
