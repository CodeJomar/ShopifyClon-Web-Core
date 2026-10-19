"use client"

import { cn } from "@/shared/utils/cn"
import { textoSecundario, textoTitulo } from "./estilos"

// Encabezado común de los paneles de la caja
export function EncabezadoPanel({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3">
      <h3 className={cn("truncate text-sm font-bold sm:text-base", textoTitulo)}>{titulo}</h3>
      <span
        className={cn(
          "shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold dark:bg-stone-800",
          textoSecundario
        )}
      >
        {detalle}
      </span>
    </div>
  )
}
