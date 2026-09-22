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
      className={cn(
        // Respeto estricto a la regla de curva: rounded-full con altura fija y padding horizontal seguro
        "flex w-full items-center gap-3 rounded-full text-sm font-medium transition-all duration-150 outline-none select-none cursor-pointer",
        isSubItem
          ? "h-9 px-6 text-slate-600 dark:text-stone-400 text-[13px] hover:text-[#4C0107] dark:hover:text-white hover:bg-[#EDE5E6]/60 dark:hover:bg-stone-800"
          : "h-11 px-5 text-slate-700 dark:text-stone-400 hover:bg-[#EDE5E6]/70 dark:hover:bg-stone-800 hover:text-[#4C0107] dark:hover:text-white",

        // Estado Activo (como KDS en tu prototipo)
        isActive && "bg-[#EDE5E6] dark:bg-stone-800 text-[#4C0107] dark:text-white font-semibold",

        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn(
          "flex items-center justify-center shrink-0",
          isActive ? "text-[#4C0107] dark:text-white" : "text-slate-500 dark:text-stone-400",
          isSubItem ? "size-4" : "size-5"
        )}>
          {icon}
        </span>
      )}
      <span className="truncate flex-1 text-left">{children}</span>
    </button>
  )
}