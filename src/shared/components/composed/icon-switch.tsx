import * as React from "react"
import { Switch } from "@/shared/components/ui/switch"
import { cn } from "@/shared/utils/cn"

export interface IconSwitchProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const IconSwitch = React.forwardRef<React.ElementRef<typeof Switch>, IconSwitchProps>(
  ({ leftIcon, rightIcon, containerClassName, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-full bg-slate-50/80 px-3 py-2 border shadow-sm",
          containerClassName
        )}
      >
        {leftIcon && (
          <div className="text-slate-600 flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <Switch ref={ref} className={className} {...props} />

        {rightIcon && (
          <div className="text-slate-600 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
IconSwitch.displayName = "IconSwitch"

export { IconSwitch }