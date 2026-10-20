"use client"

import * as React from "react"
import { Menu as DropdownPrimitive } from "@base-ui/react/menu"
import { cn } from "@/shared/utils/cn"

const DropdownMenu = DropdownPrimitive.Root
const DropdownMenuTrigger = DropdownPrimitive.Trigger
const DropdownMenuGroup = DropdownPrimitive.Group

function DropdownMenuContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  children,
  ...props
}: DropdownPrimitive.Popup.Props &
  Pick<DropdownPrimitive.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} className="isolate z-[200]">
        <DropdownPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-card p-1.5 text-foreground shadow-lg ring-1 ring-black/5",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </DropdownPrimitive.Popup>
      </DropdownPrimitive.Positioner>
    </DropdownPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: DropdownPrimitive.Item.Props) {
  return (
    <DropdownPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
        "focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
}