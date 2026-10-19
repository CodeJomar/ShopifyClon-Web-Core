"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { textoSecundario, textoTitulo } from "./estilos"

/* -------------------------------------------------------------------------- */
/*                              Estructura de modal                           */
/* -------------------------------------------------------------------------- */

export function ModalShell({
  titulo,
  subtitulo,
  icono,
  ancho = "max-w-md",
  bloqueado = false,
  onClose,
  children,
}: {
  titulo: string
  subtitulo?: React.ReactNode
  icono?: React.ReactNode
  ancho?: string
  bloqueado?: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const tituloId = React.useId()

  // Cierre con Escape y foco inicial dentro del modal
  React.useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !bloqueado) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, bloqueado])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="presentation"
        onClick={() => !bloqueado && onClose()}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs dark:bg-black/70"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl outline-none animate-in fade-in-0 zoom-in-95 duration-150 dark:border-stone-800 dark:bg-stone-900",
          ancho
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-stone-800">
          <div className="flex items-start gap-3">
            {icono && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-[#E7B7BC]">
                {icono}
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              <h2 id={tituloId} className={cn("text-lg font-bold", textoTitulo)}>
                {titulo}
              </h2>
              {subtitulo && <p className={cn("text-xs", textoSecundario)}>{subtitulo}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={bloqueado}
            aria-label="Cerrar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function CampoError({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null
  return <span className="text-xs font-medium text-red-600 dark:text-red-400">{mensaje}</span>
}

/** Pie estándar de acciones: dos o más botones centrados y del mismo tamaño; uno solo, a la derecha. */
export function PieAcciones({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 dark:border-stone-800 [&>*]:w-full sm:flex-row sm:justify-end sm:has-[>:nth-child(2)]:justify-center sm:[&>*]:w-44">
      {children}
    </div>
  )
}
