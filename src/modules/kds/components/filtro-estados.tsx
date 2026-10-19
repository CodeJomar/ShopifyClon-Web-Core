"use client"

import { cn } from "@/shared/utils/cn"
import { type FiltroEstadoKds } from "../schema"
import { FILTRO_CONFIG } from "./config-estados"

/* -------------------------------------------------------------------------- */
/*                           Barra de filtros                                  */
/* -------------------------------------------------------------------------- */

export function FiltroEstados({
  filtro,
  setFiltro,
  contadores,
}: {
  filtro: FiltroEstadoKds
  setFiltro: (f: FiltroEstadoKds) => void
  contadores: Record<FiltroEstadoKds, number>
}) {
  const opciones: FiltroEstadoKds[] = ["todas", "pendiente", "en_preparacion"]

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-100/70 dark:bg-stone-900/60 border border-slate-200/60 dark:border-stone-800">
      {opciones.map((opcion) => {
        const { icon: Icono, label } = FILTRO_CONFIG[opcion]
        const activo = filtro === opcion
        return (
          <button
            key={opcion}
            type="button"
            onClick={() => setFiltro(opcion)}
            aria-pressed={activo}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer min-h-[36px]",
              activo
                ? "bg-[#4C0107] text-white shadow-xs dark:bg-stone-100 dark:text-stone-900 font-bold"
                : "bg-white/80 dark:bg-stone-800/80 text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-800",
            )}
          >
            <Icono className="size-3.5 shrink-0" />
            <span>{label}</span>
            <span
              className={cn(
                "ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums font-bold",
                activo
                  ? "bg-white/20 text-white dark:bg-stone-900/30 dark:text-stone-900"
                  : "bg-slate-100 text-slate-600 dark:bg-stone-700 dark:text-stone-300",
              )}
            >
              {contadores[opcion]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
