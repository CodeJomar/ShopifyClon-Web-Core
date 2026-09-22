"use client"
import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/shared/utils/cn"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & { size?: "sm" | "default" }
>(({ className, size = "default", ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    data-size={size}
    className={cn(
      "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-colors outline-none cursor-pointer",
      "focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      "data-[size=default]:h-6 data-[size=default]:w-11",
      "data-[size=sm]:h-5 data-[size=sm]:w-9",
      // Colores de la marca y estados
      "data-checked:bg-[#4C0107] data-unchecked:bg-slate-200 dark:data-unchecked:bg-stone-800",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
        "group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4",
        "group-data-[size=default]/switch:data-checked:translate-x-5",
        "group-data-[size=sm]/switch:data-checked:translate-x-4",
        "group-data-[size=default]/switch:data-unchecked:translate-x-0",
        "group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = "Switch"

export { Switch }