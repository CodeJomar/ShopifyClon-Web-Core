"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/shared/utils/cn"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Altura reducida a h-11 para un perfil más estilizado y propio de un selector
        "inline-flex h-11 w-fit items-center justify-center rounded-full bg-white dark:bg-stone-800/80 p-0 text-slate-500 dark:text-stone-400 border dark:border-stone-700/50 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export interface TabsTriggerProps extends TabsPrimitive.Tab.Props {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  activeLeftIcon?: React.ReactNode; // Control del ícono dinámico
}

function TabsTrigger({
  className,
  children,
  leftIcon,
  rightIcon,
  activeLeftIcon,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // CAMBIO CLAVE: Añadimos 'w-full' para que el tab ocupe toda la celda del grid equitativo
        "group/trigger inline-flex h-full items-center justify-center gap-2 rounded-full px-8 py-2 text-base font-semibold transition-all outline-none whitespace-nowrap cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-0",
        "disabled:pointer-events-none disabled:opacity-50",

        "hover:text-[#4C0107] hover:bg-[#EDE5E6] dark:hover:bg-stone-800 dark:hover:text-white",

        "data-active:bg-[#4C0107] data-active:text-white data-active:shadow-md dark:data-active:bg-white dark:data-active:text-black",
        "data-active:hover:bg-[#4C0107]/90 data-active:hover:text-white dark:data-active:hover:bg-slate-200 dark:data-active:hover:text-black",

        className
      )}
      {...props}
    >
      {leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>}

      {activeLeftIcon && (
        <span className="hidden group-data-active/trigger:flex items-center shrink-0">
          {activeLeftIcon}
        </span>
      )}

      {children}

      {rightIcon && <span className="flex items-center shrink-0">{rightIcon}</span>}
    </TabsPrimitive.Tab>
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none flex-1", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }