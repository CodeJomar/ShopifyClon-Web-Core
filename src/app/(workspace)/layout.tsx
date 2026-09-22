"use client"

import * as React from "react"
import { cn } from "@/shared/utils/cn"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { WorkspaceHeader } from "@/shared/components/layout/workspace-header"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Cierra automáticamente el drawer si se redimensiona a desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev)
    } else {
      setIsCollapsed((prev) => !prev)
    }
  }

  return (
    <div className="h-screen w-full bg-[#EDE5E6]/40 dark:bg-stone-950 p-2 sm:p-3 lg:p-4 overflow-hidden relative transition-colors duration-200">

      {/* BACKDROP OSCURO: Solo visible en mobile/tablet cuando isMobileOpen es true */}
      {isMobileOpen && (
        <div
          role="presentation"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      <div className="flex h-full gap-3 lg:gap-4 overflow-hidden relative">

        {/* ASIDE / SIDEBAR */}
        <aside
          className={cn(
            "flex flex-col rounded-3xl bg-white dark:bg-stone-900 p-4 border border-slate-100 dark:border-stone-800 overflow-hidden shrink-0 transition-colors duration-200",
            // Comportamiento Tablet/Mobile: Oculto por defecto a la izquierda (-translate-x-[120%]),
            // con márgenes simétricos (top-2 bottom-2 left-2) para respetar la separación arriba y abajo
            "fixed top-2 bottom-2 left-2 z-50 w-72 shadow-2xl transition-transform duration-300 ease-in-out lg:shadow-sm",
            isMobileOpen ? "translate-x-0" : "-translate-x-[120%]",
            // Comportamiento Desktop: integrado estáticamente en el flex
            "lg:static lg:top-auto lg:bottom-auto lg:left-auto lg:z-auto lg:h-full lg:translate-x-0",
            "lg:transition-[width,padding] lg:duration-300 will-change-[width,transform]",
            isCollapsed ? "lg:w-20 lg:items-center lg:px-2" : "lg:w-64 xl:w-72 lg:px-4"
          )}
        >
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <AppSidebar isCollapsed={isCollapsed && !isMobileOpen} />
          </div>
        </aside>

        {/* MAIN CONTAINER */}
        <main className="flex-1 flex flex-col rounded-3xl bg-white dark:bg-stone-900 p-4 lg:p-6 shadow-sm border border-slate-100 dark:border-stone-800 h-full overflow-hidden min-w-0 transition-colors duration-200">
          <WorkspaceHeader
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}