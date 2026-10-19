"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/shared/utils/cn"

/* -------------------------------------------------------------------------- */
/*                        Marco común de los modales del POS                   */
/* -------------------------------------------------------------------------- */

export function ModalMarco({
  titulo,
  subtitulo,
  onClose,
  cerrarDeshabilitado = false,
  ancho = "max-w-md",
  children,
}: {
  titulo: string
  subtitulo?: string
  onClose: () => void
  cerrarDeshabilitado?: boolean
  ancho?: string
  children: React.ReactNode
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const tituloId = React.useId()

  // Cierre con Escape y foco inicial dentro del modal
  React.useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cerrarDeshabilitado) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, cerrarDeshabilitado])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="presentation"
        onClick={() => !cerrarDeshabilitado && onClose()}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs dark:bg-black/70"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl outline-none dark:border-stone-800 dark:bg-stone-900",
          ancho,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-stone-800">
          <div className="flex flex-col gap-0.5">
            <h2 id={tituloId} className="text-lg font-bold text-slate-900 dark:text-stone-100">
              {titulo}
            </h2>
            {subtitulo && <p className="text-xs text-slate-500 dark:text-stone-400">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={cerrarDeshabilitado}
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

export const etiquetaCampo = "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400"
