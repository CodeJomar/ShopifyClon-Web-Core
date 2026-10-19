import * as React from "react"
import { cn } from "@/shared/utils/cn"

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  state?: "default" | "error" | "success"
}

/**
 * Área de texto con etiqueta flotante, con la misma identidad que `FloatingInput` (borde, fondo, foco y estados).
 * Se usa para textos largos: descripciones, observaciones, motivos.
 */
const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, state = "default", id, disabled, rows = 3, ...props }, ref) => {
    const textareaId = id || label.replace(/\s+/g, "-").toLowerCase()

    return (
      <div className={cn("relative w-full", disabled && "cursor-not-allowed", className)}>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          placeholder=" "
          className={cn(
            "peer flex min-h-24 w-full resize-none rounded-2xl px-4 pt-7 pb-2 text-sm text-slate-900 outline-none transition-all dark:text-stone-100",

            // Fondo tenue vacío; blanco con contenido o foco (igual que Input)
            "bg-slate-50 dark:bg-stone-950",
            "not-placeholder-shown:bg-white dark:not-placeholder-shown:bg-stone-900",
            "border border-slate-300 dark:border-stone-700",

            state === "default" && [
              "focus:bg-white dark:focus:bg-stone-900",
              "focus:border-slate-600 dark:focus:border-stone-300 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-white/10",
            ],
            state === "error" && [
              "border-red-500 bg-red-50/40 text-red-900 dark:bg-red-950/20 dark:text-red-200",
              "focus:border-red-600 focus:ring-2 focus:ring-red-500/20",
            ],
            state === "success" && [
              "border-green-500 bg-green-50/40 text-green-900 dark:bg-green-950/20 dark:text-green-200",
              "focus:border-green-600 focus:ring-2 focus:ring-green-500/20",
            ],

            "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100/70 disabled:text-slate-400 disabled:opacity-60 dark:disabled:border-stone-800 dark:disabled:bg-stone-900/40 dark:disabled:text-stone-500"
          )}
          {...props}
        />

        <label
          htmlFor={textareaId}
          className={cn(
            "pointer-events-none absolute left-4 z-10 transition-all duration-200",

            disabled && "text-slate-400 dark:text-stone-600",

            // Flotando arriba (con valor o foco)
            "top-2 text-[10px] font-semibold tracking-wider",
            !disabled && "text-slate-500 dark:text-stone-400",

            // Con el área vacía, la etiqueta se ve como un placeholder de una línea
            "peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal",
            !disabled && "peer-placeholder-shown:text-slate-400 dark:peer-placeholder-shown:text-stone-500",

            // Foco
            !disabled &&
              "peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:tracking-wider peer-focus:text-slate-700 dark:peer-focus:text-stone-200",

            state === "error" && "text-red-500 peer-focus:text-red-600",
            state === "success" && "text-green-600 peer-focus:text-green-700"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)
FloatingTextarea.displayName = "FloatingTextarea"

export { FloatingTextarea }
