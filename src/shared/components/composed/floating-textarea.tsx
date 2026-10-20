import * as React from "react"
import { claseCampo, claseEstadoCampo, type EstadoCampo } from "@/shared/components/ui/input"
import { cn } from "@/shared/utils/cn"

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  state?: EstadoCampo
}

/**
 * Área de texto con etiqueta "outlined cut" (docs/diseno-web.md §4.2). Vacía, la etiqueta va en la primera línea;
 * al enfocar o tener texto sube y corta el borde superior, igual que el campo de una línea.
 */
const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, state = "default", id, disabled, rows = 3, ...props }, ref) => {
    const textareaId = id || label.replace(/\s+/g, "-").toLowerCase()

    return (
      <div className={cn("relative w-full", className)}>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          aria-invalid={state === "error" || undefined}
          placeholder=" "
          className={cn(
            "peer flex min-h-24 w-full resize-none rounded-xl px-3.5 pt-4 pb-2.5 text-[13px] font-medium",
            claseCampo,
            claseEstadoCampo[state]
          )}
          {...props}
        />

        <label
          htmlFor={textareaId}
          className={cn(
            "pointer-events-none absolute left-3 top-[1.1rem] z-10 origin-left px-1 text-[13px] font-medium text-muted-foreground transition-all duration-200",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-card peer-focus:text-[10.5px] peer-focus:font-bold peer-focus:text-brand-text",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:text-[10.5px] peer-[:not(:placeholder-shown)]:font-bold",
            state === "error" && "text-destructive-text",
            state === "success" && "text-tono-exito-fg"
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
