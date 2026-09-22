import * as React from "react"
import { Select, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { cn } from "@/shared/utils/cn"

export interface FloatingSelectProps extends React.ComponentPropsWithoutRef<typeof Select> {
  label: string
  state?: "default" | "error" | "success"
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
        <SelectTrigger
          id={selectId}
          state={state}
          leftIcon={leftIcon}
          className="peer w-full"
        >
          <SelectValue placeholder=" " />
        </SelectTrigger>

        <label
          htmlFor={selectId}
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-10",

            leftIcon ? "left-11" : "left-4",

            // Estado activo (arriba)
            "top-2 text-[10px] font-semibold text-slate-500 dark:text-stone-400 tracking-wider",

            // Estado vacío (centrado vertical)
            "peer-data-[placeholder]:top-1/2 peer-data-[placeholder]:-translate-y-1/2 peer-data-[placeholder]:text-sm peer-data-[placeholder]:font-normal peer-data-[placeholder]:text-slate-400 dark:peer-data-[placeholder]:text-stone-500 peer-data-[placeholder]:tracking-normal",

            // Estado abierto / foco
            "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-slate-700 dark:peer-focus:text-stone-200 peer-focus:tracking-wider",
            "peer-data-popup-open:top-2 peer-data-popup-open:translate-y-0 peer-data-popup-open:text-[10px] peer-data-popup-open:font-bold peer-data-popup-open:text-slate-700 dark:peer-data-popup-open:text-stone-200 peer-data-popup-open:tracking-wider",

            state === "error" && "text-red-500 peer-focus:text-red-600",
            state === "success" && "text-green-600 peer-focus:text-green-700"
          )}
        >
          {label}
        </label>
      </div>

      {children}
    </Select>
  )
}