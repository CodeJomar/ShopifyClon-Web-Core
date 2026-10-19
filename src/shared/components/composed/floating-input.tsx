import * as React from "react"
import { Copy, Lock, TriangleAlert } from "lucide-react"
import { Input, type EstadoCampo } from "@/shared/components/ui/input"
import { toast } from "@/shared/components/ui/toast"
import { cn } from "@/shared/utils/cn"

/**
 * Etiqueta "outlined cut" (docs/diseno-web.md §4.2): centrada dentro del campo vacío; al enfocar o tener valor
 * sube y corta el borde superior con el fondo de la isla. Los selectores `peer-[...]` son el mismo estado para
 * input, select y textarea.
 */
export const claseEtiqueta = cn(
  "pointer-events-none absolute z-10 origin-left -translate-y-1/2 px-1 text-[13px] font-medium text-muted-foreground transition-all duration-200",
  "peer-focus:top-0 peer-focus:bg-card peer-focus:text-[10.5px] peer-focus:font-bold peer-focus:text-brand-text",
  "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:text-[10.5px] peer-[:not(:placeholder-shown)]:font-bold",
  "peer-disabled:bg-transparent peer-disabled:text-muted-foreground"
)

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  state?: EstadoCampo
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /** Texto de ayuda debajo del campo (11 px). Con `state="error"` el mensaje de error va en su lugar. */
  ayuda?: string
  /** Mensaje de error debajo del campo, con ícono. */
  mensajeError?: string
  /** Solo lectura con botón de copiar (docs/diseno-web.md §4.2). */
  copiable?: boolean
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, state = "default", leftIcon, rightIcon, ayuda, mensajeError, copiable, id, disabled, readOnly, value, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, "-").toLowerCase()
    const mensaje = state === "error" ? mensajeError : ayuda
    const esSoloLectura = readOnly && copiable

    const copiar = async () => {
      const texto = String(value ?? "")
      try {
        await navigator.clipboard.writeText(texto)
        toast.add({ type: "success", title: "Copiado", description: `${label} copiado al portapapeles.` })
      } catch {
        toast.add({ type: "error", title: "No se pudo copiar", description: "Copia el texto manualmente." })
      }
    }

    return (
      <div className={cn("relative w-full", className)}>
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex -translate-y-1/2 items-center text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <Input
          id={inputId}
          ref={ref}
          state={state}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          placeholder=" "
          className={cn("peer h-11", leftIcon ? "pl-11" : "", rightIcon || esSoloLectura ? "pr-11" : "")}
          {...props}
        />

        <label htmlFor={inputId} className={cn(claseEtiqueta, leftIcon ? "left-11" : "left-3", state === "error" && "text-destructive-text peer-focus:text-destructive-text", state === "success" && "text-tono-exito-fg")}>
          {label}
        </label>

        {esSoloLectura ? (
          <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 text-muted-foreground">
            <Lock aria-hidden="true" className="size-3.5" />
            <button
              type="button"
              onClick={copiar}
              aria-label={`Copiar ${label}`}
              className="flex size-7 items-center justify-center rounded-lg text-brand-text outline-none hover:bg-brand-strong/12 focus-visible:ring-[3px] focus-visible:ring-ring/25 cursor-pointer"
            >
              <Copy aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        ) : rightIcon ? (
          <div className="absolute right-3.5 top-1/2 z-10 flex -translate-y-1/2 items-center text-muted-foreground">{rightIcon}</div>
        ) : null}

        {mensaje && (
          <p
            id={`${inputId}-ayuda`}
            className={cn(
              "mt-1.5 flex items-center gap-1 px-1 text-[11px]",
              state === "error" ? "font-bold text-destructive-text" : "text-muted-foreground"
            )}
          >
            {state === "error" && <TriangleAlert aria-hidden="true" className="size-3" />}
            {mensaje}
          </p>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
