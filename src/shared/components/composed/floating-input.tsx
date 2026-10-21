"use client"

import * as React from "react"
import { Copy, Eye, EyeOff, Lock, TriangleAlert } from "lucide-react"
import { Input, type EstadoCampo } from "@/shared/components/ui/input"
import { toast } from "@/shared/components/ui/toast"
import { cn } from "@/shared/utils/cn"

/**
 * Etiqueta "outlined cut" (docs/diseno-web.md §4.2): centrada dentro del campo vacío; al enfocar o tener valor
 * sube y corta el borde superior con el fondo de la isla. Los selectores `peer-[...]` son el mismo estado para
 * input, select y textarea.
 */
export const claseCorteEtiqueta = cn(
  // Mitad superior = fondo del contenedor; mitad inferior = fondo del campo (muted en deshabilitado y solo lectura)
  "[--etiqueta-corte:linear-gradient(to_bottom,var(--campo-exterior)_50%,var(--campo-fondo,var(--campo-exterior))_50%)]",
  "peer-disabled:[--campo-fondo:var(--muted)] peer-[:is(input,textarea):read-only]:[--campo-fondo:var(--muted)]"
)

export const claseEtiqueta = cn(
  "pointer-events-none absolute top-1/2 z-10 origin-left -translate-y-1/2 px-1 text-[13px] font-medium text-muted-foreground transition-all duration-200",
  claseCorteEtiqueta,
  "peer-focus:top-0 peer-focus:[background-image:var(--etiqueta-corte)] peer-focus:text-[10.5px] peer-focus:font-bold peer-focus:text-brand-text",
  "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:[background-image:var(--etiqueta-corte)] peer-[:not(:placeholder-shown)]:text-[10.5px] peer-[:not(:placeholder-shown)]:font-bold",
  "peer-disabled:text-muted-foreground"
)

/** Botón de acción a la derecha del campo (§4.2): 28 px, hover con --primary al 12 %. */
export const claseBotonAccion =
  "flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-primary/12 hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/25"

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
  ({ className, label, state = "default", leftIcon, rightIcon, ayuda, mensajeError, copiable, id, disabled, readOnly, value, type, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, "-").toLowerCase()
    const mensaje = state === "error" ? mensajeError : ayuda
    const esSoloLectura = readOnly && copiable
    const esContrasena = type === "password"
    const [mostrar, setMostrar] = React.useState(false)
    const refInterno = React.useRef<HTMLInputElement | null>(null)
    const asignarRef = React.useCallback(
      (nodo: HTMLInputElement | null) => {
        refInterno.current = nodo
        if (typeof ref === "function") ref(nodo)
        else if (ref) ref.current = nodo
      },
      [ref]
    )
    const izquierda = esSoloLectura ? <Lock className="size-4" /> : leftIcon
    const hayAccion = esSoloLectura || esContrasena || Boolean(rightIcon)

    const copiar = async () => {
      // Lee el valor del input: funciona también con `defaultValue` (no controlado)
      const texto = String(value ?? refInterno.current?.value ?? "")
      try {
        await navigator.clipboard.writeText(texto)
        toast.add({ type: "success", title: "Copiado", description: `${label} copiado al portapapeles.` })
      } catch {
        toast.add({ type: "error", title: "No se pudo copiar", description: "Copia el texto manualmente." })
      }
    }

    return (
      <div className={cn("w-full", className)}>
        {/* Solo el campo y sus íconos: los íconos se centran respecto a este bloque, no al mensaje de abajo */}
        <div className="relative">
          {izquierda && (
            <div aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex -translate-y-1/2 items-center text-muted-foreground">
              {izquierda}
            </div>
          )}

          <Input
            id={inputId}
            ref={asignarRef}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            type={esContrasena && mostrar ? "text" : type}
            placeholder=" "
            aria-describedby={mensaje ? `${inputId}-ayuda` : undefined}
            className={cn("peer h-11", izquierda ? "pl-11" : "", hayAccion ? "pr-11" : "")}
            {...props}
          />

          <label htmlFor={inputId} className={cn(claseEtiqueta, izquierda ? "left-11" : "left-3", state === "error" && "text-destructive-text peer-focus:text-destructive-text", state === "success" && "text-tono-exito-fg")}>
            {label}
          </label>

          {esSoloLectura ? (
            <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center">
              <button
                type="button"
                onClick={copiar}
                aria-label={`Copiar ${label}`}
                className={claseBotonAccion}
              >
                <Copy aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : esContrasena && !disabled ? (
            <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center">
              <button
                type="button"
                onClick={() => setMostrar((v) => !v)}
                aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={mostrar}
                className={claseBotonAccion}
              >
                {mostrar ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              </button>
            </div>
          ) : rightIcon ? (
            <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center text-muted-foreground">{rightIcon}</div>
          ) : null}
        </div>

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
