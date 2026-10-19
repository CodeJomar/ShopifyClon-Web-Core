"use client"

import { cn } from "@/shared/utils/cn"
import { filtroDisponibilidadSchema, type FiltroDisponibilidad, type ResumenMenu } from "../schema"
import { RESUMEN_CONFIG, panelClass } from "./estilos"

/* -------------------------------------------------------------------------- */
/*                              Resumen de stock                              */
/* -------------------------------------------------------------------------- */

export function ResumenStock({
  resumen,
  activo,
  onSeleccionar,
}: {
  resumen: ResumenMenu
  activo: FiltroDisponibilidad
  onSeleccionar: (filtro: FiltroDisponibilidad) => void
}) {
  const valores: Record<FiltroDisponibilidad, number> = {
    todos: resumen.total,
    disponibles: resumen.disponibles,
    agotados: resumen.agotados,
  }

  return (
    <div className="grid grid-cols-12 gap-3 sm:gap-4">
      {filtroDisponibilidadSchema.options.map((filtro) => {
        const config = RESUMEN_CONFIG[filtro]
        const seleccionado = activo === filtro
        return (
          <button
            key={filtro}
            type="button"
            onClick={() => onSeleccionar(filtro)}
            aria-pressed={seleccionado}
            className={cn(
              panelClass,
              "col-span-4 flex cursor-pointer flex-col items-start gap-1 p-3 sm:p-4 text-left rounded-2xl transition-all shadow-xs",
              "hover:border-[#4C0107]/40 dark:hover:border-stone-600",
              seleccionado &&
                "border-[#4C0107]/60 ring-2 ring-[#4C0107]/20 bg-white dark:bg-stone-900 dark:border-stone-400 dark:ring-stone-400/20"
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs dark:text-stone-400 truncate w-full">
              {config.label}
            </span>
            <span className={cn("text-2xl font-black tabular-nums sm:text-3xl", config.valueClass)}>
              {valores[filtro]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
