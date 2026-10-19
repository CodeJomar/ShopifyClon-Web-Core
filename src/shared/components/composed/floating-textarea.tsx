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
            "peer flex min-h-24 w-full resize-none rounded-2xl px-4 pt-7 pb-2 text-sm text-foreground outline-none transition-all ",

            // Fondo tenue vacío; blanco con contenido o foco (igual que Input)
            "bg-muted ",
            "not-placeholder-shown:bg-card ",
            "border border-border ",

            state === "default" && [
              "focus:bg-card ",
              "focus:border-border  focus:ring-2 focus:ring-ring/25 dark:focus:ring-white/10",
            ],
            state === "error" && [
              "border-destructive bg-destructive/12 text-destructive-text  ",
              "focus:border-destructive focus:ring-2 focus:ring-destructive/25",
            ],
            state === "success" && [
              "border-success bg-success/12 text-tono-exito-fg  ",
              "focus:border-success focus:ring-2 focus:ring-success/25",
            ],

            "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted/70 disabled:text-muted-foreground disabled:opacity-60   "
          )}
          {...props}
        />

        <label
          htmlFor={textareaId}
          className={cn(
            "pointer-events-none absolute left-4 z-10 transition-all duration-200",

            disabled && "text-muted-foreground ",

            // Flotando arriba (con valor o foco)
            "top-2 text-[10px] font-semibold tracking-wider",
            !disabled && "text-muted-foreground ",

            // Con el área vacía, la etiqueta se ve como un placeholder de una línea
            "peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal",
            !disabled && "peer-placeholder-shown:text-muted-foreground ",

            // Foco
            !disabled &&
              "peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:tracking-wider peer-focus:text-foreground ",

            state === "error" && "text-destructive-text peer-focus:text-destructive-text",
            state === "success" && "text-tono-exito-fg peer-focus:text-tono-exito-fg"
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
