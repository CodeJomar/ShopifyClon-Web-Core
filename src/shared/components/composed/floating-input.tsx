import * as React from "react"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/utils/cn"

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  state?: "default" | "error" | "success"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, state = "default", leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, "-").toLowerCase()

    return (
      <div className={cn("relative w-full", disabled && "cursor-not-allowed", className)}>
        {leftIcon && (
          <div className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center transition-colors",
            disabled ? "text-muted-foreground " : "text-muted-foreground "
          )}>
            {leftIcon}
          </div>
        )}

        <Input
          id={inputId}
          ref={ref}
          state={state}
          disabled={disabled}
          placeholder=" "
          className={cn(
            "peer h-14 pt-5 pb-1",
            leftIcon ? "pl-11" : "pl-4",
            rightIcon ? "pr-11" : "pr-4"
          )}
          {...props}
        />

        <label
          htmlFor={inputId}
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-10",
            leftIcon ? "left-11" : "left-4",

            // Si está deshabilitado
            disabled && "text-muted-foreground ",

            // Flotando arriba (cuando tiene valor o foco)
            "top-2 text-[10px] font-semibold tracking-wider",
            !disabled && "text-muted-foreground ",

            // Placeholder centrado cuando está vacío
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal",
            !disabled && "peer-placeholder-shown:text-muted-foreground ",

            // Foco
            !disabled && "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-foreground  peer-focus:tracking-wider",

            state === "error" && "text-destructive-text peer-focus:text-destructive-text",
            state === "success" && "text-tono-exito-fg peer-focus:text-tono-exito-fg"
          )}
        >
          {label}
        </label>

        {rightIcon && (
          <div className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center transition-colors",
            disabled
              ? "text-muted-foreground  cursor-not-allowed"
              : "text-muted-foreground  cursor-pointer hover:text-muted-foreground "
          )}>
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }