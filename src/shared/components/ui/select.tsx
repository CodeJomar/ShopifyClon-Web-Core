"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/shared/utils/cn"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left capitalize", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  leftIcon,
  state = "default",
  disabled,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
  leftIcon?: React.ReactNode
  state?: "default" | "error" | "success"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      disabled={disabled}
      className={cn(
        // Altura h-14 (56px) exacta al input
        "peer relative flex h-14 w-full items-center rounded-2xl text-sm text-foreground  transition-all outline-none cursor-pointer",

        // Fondo y bordes sincronizados
        "bg-muted  not-data-[placeholder]:bg-card ",
        "border border-border ",

        "pt-5 pb-1 text-left",
        leftIcon ? "pl-11" : "pl-4",
        "pr-11",

        // Foco / Popup abierto
        state === "default" && [
          "focus:bg-card ",
          "focus:border-border  focus:ring-2 focus:ring-ring/25 dark:focus:ring-white/10",
          "data-popup-open:border-border  data-popup-open:ring-2 data-popup-open:ring-ring/25 dark:data-popup-open:ring-white/10"
        ],

        // Estados semánticos
        state === "error" && "border-destructive bg-destructive/12  text-destructive-text ",
        state === "success" && "border-success bg-success/12  text-tono-exito-fg ",

        // Deshabilitado idéntico al Input
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/70  disabled:border-border  disabled:text-muted-foreground ",

        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 *:data-[slot=select-value]:line-clamp-1",
        className
      )}
      {...props}
    >
      {leftIcon && (
        <span className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors",
          disabled ? "text-muted-foreground " : "text-muted-foreground "
        )}>
          {leftIcon}
        </span>
      )}

      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      <SelectPrimitive.Icon
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-200 pointer-events-none data-popup-open:rotate-180",
          disabled ? "text-muted-foreground " : "text-muted-foreground "
        )}
        render={<ChevronDownIcon className="size-4" />}
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-[200]"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            // Sombras más profundas (shadow-lg) y borde sutil para separarlo del fondo
            "relative isolate z-[200] max-h-[var(--available-height)] w-[var(--anchor-width)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-xl bg-card text-foreground shadow-lg border border-border ring-1 ring-black/5 duration-100",
            "data-[align-trigger=true]:animate-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="p-1.5">{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2.5 pr-8 pl-3 text-sm outline-none select-none transition-colors",
        "focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Añadido 'capitalize' para mantener consistencia visual */}
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap capitalize">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator render={<span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center" />}>
        <CheckIcon className="size-4 text-brand-text" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return <SelectPrimitive.GroupLabel data-slot="select-label" className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("pointer-events-none -mx-1 my-1 h-px bg-muted", className)} {...props} />
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow data-slot="select-scroll-up-button" className={cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-card py-1", className)} {...props}>
      <ChevronUpIcon className="size-4 text-muted-foreground" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow data-slot="select-scroll-down-button" className={cn("bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-card py-1", className)} {...props}>
      <ChevronDownIcon className="size-4 text-muted-foreground" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue }