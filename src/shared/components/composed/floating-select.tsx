import * as React from "react"
import { Select, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { cn } from "@/shared/utils/cn"
import { BordeCortado, claseCampoSinBorde, claseEtiqueta } from "@/shared/components/composed/floating-input"
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
        <SelectTrigger id={selectId} state={state} leftIcon={leftIcon} className={cn("peer w-full", claseCampoSinBorde, leftIcon ? "pl-11" : "pl-[22px]", state === "default" && "focus-visible:border-input focus-visible:ring-0")}>
          <SelectValue placeholder=" " />
        </SelectTrigger>

        <BordeCortado label={label} state={state} izquierda={Boolean(leftIcon)} flotado="peer-[:not([data-placeholder])]:[&>legend]:max-w-full peer-data-popup-open:[&>legend]:max-w-full" />

        <label
          htmlFor={selectId}
          className={cn(
            claseEtiqueta,
            leftIcon ? "left-11" : "left-5",
            "top-1/2",
            "peer-[:not([data-placeholder])]:top-0 peer-[:not([data-placeholder])]:text-[10.5px] peer-[:not([data-placeholder])]:font-bold",
            "peer-data-popup-open:top-0 peer-data-popup-open:text-[10.5px] peer-data-popup-open:font-bold peer-data-popup-open:text-primary",
            // El foco queda en el botón tras elegir: la etiqueta solo se tiñe de marca mientras el popup está abierto
            state === "default" && "peer-focus:text-muted-foreground peer-data-popup-open:text-primary!",
            state === "error" && "text-destructive-text peer-focus:text-destructive-text peer-data-popup-open:text-destructive-text",
            state === "success" && "text-primary"
          )}
        >
          {label}
        </label>
      </div>

      {children}
    </Select>
  )
}
