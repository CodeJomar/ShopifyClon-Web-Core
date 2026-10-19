import * as React from "react"

import { cn } from "@/shared/utils/cn"

// En pantallas de poca altura se ocultan textos secundarios para que el contenido quepa sin scroll
export const ocultarEnPantallaBaja = "[@media(max-height:700px)]:hidden"

/** Encabezado estándar de las vistas de Local y Equipo (título, descripción y acciones). */
export function EncabezadoSeccion({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion: string
  acciones?: React.ReactNode
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-stone-100">{titulo}</h1>
        <p className={cn("line-clamp-1 text-xs text-slate-500 sm:text-sm dark:text-stone-400", ocultarEnPantallaBaja)}>
          {descripcion}
        </p>
      </div>
      {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
    </div>
  )
}
