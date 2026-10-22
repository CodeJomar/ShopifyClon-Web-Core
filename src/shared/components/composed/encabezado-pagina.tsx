import * as React from "react"
import { cn } from "@/shared/utils/cn"

interface EncabezadoPaginaProps {
  titulo: string
  descripcion?: React.ReactNode
  /** Acciones de la pantalla (botón principal, filtros de rango…), a la derecha en escritorio. */
  acciones?: React.ReactNode
  className?: string
}

/** Cabecera estándar de cada pantalla del panel: título 18/800, descripción 13 y acciones a la derecha. */
export function EncabezadoPagina({ titulo, descripcion, acciones, className }: EncabezadoPaginaProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">{titulo}</h1>
        {descripcion && <p className="mt-1 text-[13px] text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  )
}
