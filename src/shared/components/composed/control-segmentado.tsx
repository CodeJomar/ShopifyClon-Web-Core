"use client"

import * as React from "react"
import { cn } from "@/shared/utils/cn"

interface OpcionSegmentada<T extends string | number> {
  valor: T
  etiqueta: React.ReactNode
}

interface ControlSegmentadoProps<T extends string | number> {
  opciones: OpcionSegmentada<T>[]
  valor: T
  onCambiar: (valor: T) => void
  "aria-label": string
  className?: string
}

/** Selector de una opción entre pocas (rango de fechas, estado de una lista): píldora con la opción activa elevada. */
export function ControlSegmentado<T extends string | number>({ opciones, valor, onCambiar, className, ...props }: ControlSegmentadoProps<T>) {
  return (
    <div role="group" aria-label={props["aria-label"]} className={cn("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-muted p-1 no-scrollbar", className)}>
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor
        return (
          <button
            key={String(opcion.valor)}
            type="button"
            aria-pressed={activa}
            onClick={() => onCambiar(opcion.valor)}
            className={cn(
              "h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-bold outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/25",
              activa ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-brand-text",
            )}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
