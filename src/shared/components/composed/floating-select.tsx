import * as React from "react"
import { Select, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { cn } from "@/shared/utils/cn"
import { claseEtiqueta } from "@/shared/components/composed/floating-input"
import type { EstadoCampo } from "@/shared/components/ui/input"

export interface FloatingSelectProps extends React.ComponentPropsWithoutRef<typeof Select> {
  label: string
  state?: EstadoCampo
  leftIcon?: React.ReactNode
  id?: string
}

export function FloatingSelect({
  label,
  state = "default",
  leftIcon,
  id,
  children,
  value,
  onValueChange,
  defaultValue,
  ...props
}: FloatingSelectProps) {
  const selectId = id || label.replace(/\s+/g, "-").toLowerCase()

  return (
    <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue} {...props}>
      <div className="relative w-full">
        <SelectTrigger id={selectId} state={state} leftIcon={leftIcon} className="peer w-full">
          <SelectValue placeholder=" " />
        </SelectTrigger>

        <label
          htmlFor={selectId}
          className={cn(
            claseEtiqueta,
            leftIcon ? "left-11" : "left-3",
            "top-1/2",
            "peer-[:not([data-placeholder])]:top-0 peer-[:not([data-placeholder])]:bg-card peer-[:not([data-placeholder])]:text-[10.5px] peer-[:not([data-placeholder])]:font-bold",
            "peer-data-popup-open:top-0 peer-data-popup-open:bg-card peer-data-popup-open:text-[10.5px] peer-data-popup-open:font-bold peer-data-popup-open:text-brand-text",
            state === "error" && "text-destructive-text",
            state === "success" && "text-tono-exito-fg"
          )}
        >
          {label}
        </label>
      </div>

      {children}
    </Select>
  )
}
