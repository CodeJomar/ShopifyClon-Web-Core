import * as React from "react"
import { cn } from "@/shared/utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: "default" | "error" | "success"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Altura base uniforme h-14 (56px) para calzar exactamente con el Select
          "flex h-14 w-full rounded-2xl px-4 text-sm text-foreground  transition-all outline-none",

          // Fondo base tenue cuando está vacío, y blanco limpio cuando TIENE CONTENIDO o foco
          "bg-muted ",
          "not-placeholder-shown:bg-card ",

          // Borde base pronunciado en reposo
          "border border-border ",

          // Estado default: Sin efecto en hover; al interactuar (focus) fondo blanco y ring suave
          state === "default" && [
            "focus:bg-card ",
            "focus:border-border  focus:ring-2 focus:ring-ring/25 dark:focus:ring-white/10"
          ],

          // Estado error: borde y fondo tintado constante
          state === "error" && [
            "border-destructive bg-destructive/12  text-destructive-text ",
            "focus:border-destructive focus:ring-2 focus:ring-destructive/25"
          ],

          // Estado success: borde y fondo tintado constante
          state === "success" && [
            "border-success bg-success/12  text-tono-exito-fg ",
            "focus:border-success focus:ring-2 focus:ring-success/25"
          ],

          // ESTADO DESHABILITADO: Armónico y sutil
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/70  disabled:border-border  disabled:text-muted-foreground ",

          "placeholder:text-muted-foreground ",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",

          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }