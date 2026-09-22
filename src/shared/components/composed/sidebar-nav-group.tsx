"use client"

import * as React from "react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/shared/components/ui/collapsible"
import { SidebarNavItem } from "./sidebar-nav-item"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/utils/cn"

export interface SubMenuItem {
  title: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SidebarNavGroupProps {
  title: string;
  icon: React.ReactNode;
  items: SubMenuItem[];
  defaultOpen?: boolean;
}

export function SidebarNavGroup({
  title,
  icon,
  items,
  defaultOpen = false,
}: SidebarNavGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger
        type="button"
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-full px-5 text-sm font-medium text-slate-700 dark:text-stone-400 transition-colors outline-none select-none cursor-pointer",
          "hover:bg-[#EDE5E6]/70 hover:text-[#4C0107] dark:hover:bg-stone-800 dark:hover:text-white",
          isOpen && "text-[#4C0107] dark:text-white font-semibold"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={cn("shrink-0 size-5 flex items-center justify-center", isOpen ? "text-[#4C0107] dark:text-white" : "text-slate-500 dark:text-stone-400")}>
            {icon}
          </span>
          <span className="truncate">{title}</span>
        </div>

        <ChevronDown
          className={cn(
            "size-4 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-[#4C0107] dark:text-white"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-1 pb-1 pl-4 space-y-1">
        {items.map((subItem, index) => (
          <SidebarNavItem
            key={index}
            isSubItem
            icon={subItem.icon}
            isActive={subItem.isActive}
            onClick={subItem.onClick}
          >
            {subItem.title}
          </SidebarNavItem>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}