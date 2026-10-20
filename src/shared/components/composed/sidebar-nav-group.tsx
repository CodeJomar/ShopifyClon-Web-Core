"use client"

import * as React from "react"
import Link from "next/link"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/shared/components/ui/collapsible"
import { SidebarNavItem } from "./sidebar-nav-item"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/utils/cn"

export interface SubMenuItem {
  title: string;
  icon?: React.ReactNode;
  /** Si se indica, el subítem navega a esta ruta. */
  href?: string;
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
          "flex h-11 w-full items-center justify-between gap-3 rounded-full px-5 text-sm font-medium text-foreground  transition-colors outline-none select-none cursor-pointer",
          "hover:bg-brand-strong/12 hover:text-brand-text  dark:hover:text-white",
          isOpen && "text-brand-text dark:text-white font-semibold"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={cn("shrink-0 size-5 flex items-center justify-center", isOpen ? "text-brand-text dark:text-white" : "text-muted-foreground ")}>
            {icon}
          </span>
          <span className="truncate">{title}</span>
        </div>

        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-brand-text dark:text-white"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-1 pb-1 pl-4 space-y-1">
        {items.map((subItem) => {
          const item = (
            <SidebarNavItem isSubItem icon={subItem.icon} isActive={subItem.isActive} onClick={subItem.onClick}>
              {subItem.title}
            </SidebarNavItem>
          )
          return subItem.href ? (
            <Link key={subItem.title} href={subItem.href} className="block w-full cursor-pointer">
              {item}
            </Link>
          ) : (
            <React.Fragment key={subItem.title}>{item}</React.Fragment>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}