import * as React from "react"
import { cn } from "@/shared/utils/cn"

export interface SidebarNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  isActive?: boolean;
  isSubItem?: boolean;
}

export function SidebarNavItem({
  icon,
  isActive = false,
  isSubItem = false,
  className,
  children,
  ...props
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      data-active={isActive ? "true" : "false"}
      className={cn(
        // Respeto estricto a la regla de curva: rounded-full con altura fija y padding horizontal seguro
        "flex w-full items-center gap-3 rounded-full text-sm font-medium transition-all duration-150 outline-none select-none cursor-pointer",
        isSubItem
          ? "h-9 px-6 text-muted-foreground  text-[13px] hover:text-brand-text dark:hover:text-white hover:bg-brand-strong/12 "
          : "h-11 px-5 text-foreground  hover:bg-brand-strong/12  hover:text-brand-text dark:hover:text-white",

        // Estado Activo (como en el prototipo)
        isActive && "bg-brand-strong/12  text-brand-text dark:text-white font-semibold",

        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn(
          "flex items-center justify-center shrink-0",
          isActive ? "text-brand-text dark:text-white" : "text-muted-foreground ",
          isSubItem ? "size-4" : "size-5"
        )}>
          {icon}
        </span>
      )}
      <span className="truncate flex-1 text-left">{children}</span>
    </button>
  )
}