"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "@/shared/utils/cn"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        // Color Ghost corporativo de la marca
        "shrink-0 bg-[#EDE5E6]",
        "data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }