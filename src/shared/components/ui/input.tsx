import * as React from "react"
import { cn } from "@/shared/utils/cn"

export type EstadoCampo = "default" | "error" | "success"

// docs/diseno-web.md §4.2: borde 1.8, radio 12, alto 44. Los estados viven aquí para que input, select y textarea coincidan.
export const claseCampo = "border-[1.8px] bg-transparent text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground [&:is(input,textarea):read-only]:bg-muted [&:is(input,textarea):read-only]:font-bold disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-input"

export const claseEstadoCampo: Record<EstadoCampo, string> = {
  default: "border-input hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18",
  error: "border-destructive text-destructive-text hover:border-destructive focus-visible:border-destructive focus-visible:ring-[3.5px] focus-visible:ring-destructive/18",
  success: "border-primary focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18",
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: EstadoCampo
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={state === "error" || undefined}
        className={cn(
          "flex h-11 w-full rounded-xl px-3.5 text-[13px] font-medium",
          claseCampo,
          claseEstadoCampo[state],
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
