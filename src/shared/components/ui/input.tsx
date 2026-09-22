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
          "flex h-14 w-full rounded-2xl px-4 text-sm text-slate-900 dark:text-stone-100 transition-all outline-none",

          // Fondo base tenue cuando está vacío, y blanco limpio cuando TIENE CONTENIDO o foco
          "bg-slate-50 dark:bg-stone-950",
          "not-placeholder-shown:bg-white dark:not-placeholder-shown:bg-stone-900",

          // Borde base pronunciado en reposo
          "border border-slate-300 dark:border-stone-700",

          // Estado default: Sin efecto en hover; al interactuar (focus) fondo blanco y ring suave
          state === "default" && [
            "focus:bg-white dark:focus:bg-stone-900",
            "focus:border-slate-600 dark:focus:border-stone-300 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-white/10"
          ],

          // Estado error: borde y fondo tintado constante
          state === "error" && [
            "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-900 dark:text-red-200",
            "focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
          ],

          // Estado success: borde y fondo tintado constante
          state === "success" && [
            "border-green-500 bg-green-50/40 dark:bg-green-950/20 text-green-900 dark:text-green-200",
            "focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
          ],

          // ESTADO DESHABILITADO: Armónico y sutil
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-100/70 dark:disabled:bg-stone-900/40 disabled:border-slate-200 dark:disabled:border-stone-800 disabled:text-slate-400 dark:disabled:text-stone-500",

          "placeholder:text-slate-400 dark:placeholder:text-stone-500",
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