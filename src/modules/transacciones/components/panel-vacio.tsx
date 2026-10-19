"use client"

import { Coins } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { textoSecundario, textoTitulo } from "./estilos"

export function PanelVacio({ icono: Icono, titulo, texto }: { icono: typeof Coins; titulo: string; texto: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center dark:border-stone-700">
      <Icono className="size-6 text-slate-400 dark:text-stone-500" />
      <p className={cn("text-sm font-semibold", textoTitulo)}>{titulo}</p>
      <p className={cn("line-clamp-2 text-xs", textoSecundario)}>{texto}</p>
    </div>
  )
}
