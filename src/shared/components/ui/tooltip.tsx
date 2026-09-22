// src/shared/components/ui/tooltip.tsx
"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/shared/utils/cn"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root

function TooltipTrigger({
  asChild,
  children,
  render,
  ...props
}: TooltipPrimitive.Trigger.Props & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <TooltipPrimitive.Trigger render={children} {...props} />
  }

  return (
    <TooltipPrimitive.Trigger render={render} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({
  className,
  side = "right",
  sideOffset = 12,
  align = "center",
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} className="isolate z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // Cuerpo tipo píldora corporativa
            "relative z-50 flex items-center justify-center rounded-full bg-[#4C0107] px-4 py-1.5 text-xs font-bold text-white shadow-md select-none",

            // Pico / Punta de la gota hacia la izquierda (apuntando al sidebar)
            "before:content-[''] before:absolute before:-left-1.5 before:top-1/2 before:-translate-y-1/2",
            "before:w-0 before:h-0",
            "before:border-y-[5px] before:border-y-transparent",
            "before:border-r-[7px] before:border-r-[#4C0107]",

            // Animaciones de entrada/salida suaves
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }