"use client"

import { cn } from "@/shared/utils/cn"
import { pestanaClass } from "./estilos"

export type PanelCaja = "principal" | "movimientos" | "turnos"

// En móvil y tablet los paneles se alternan con este selector; en escritorio se ven todos a la vez
export function SelectorPaneles({
  opciones,
  activo,
  onChange,
}: {
  opciones: { id: PanelCaja; label: string; total?: number }[]
  activo: PanelCaja
  onChange: (id: PanelCaja) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Paneles de la caja"
      className="flex shrink-0 items-center gap-1 rounded-full bg-[#EDE5E6]/60 p-1 xl:hidden dark:bg-stone-800"
    >
      {opciones.map((opcion) => (
        <button
          key={opcion.id}
          type="button"
          role="tab"
          aria-selected={activo === opcion.id}
          onClick={() => onChange(opcion.id)}
          className={cn(
            "inline-flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 text-xs font-semibold transition-all",
            pestanaClass(activo === opcion.id)
          )}
        >
          <span className="truncate">{opcion.label}</span>
          {opcion.total !== undefined && <span className="shrink-0 tabular-nums opacity-70">{opcion.total}</span>}
        </button>
      ))}
    </div>
  )
}
