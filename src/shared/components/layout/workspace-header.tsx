// src/shared/components/layout/workspace-header.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  LogOut
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"
import { Switch } from "@/shared/components/ui/switch"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/utils/cn"
import { useMounted } from "@/shared/hooks/use-mounted"
import { HOME_HREF, migasDe, rutaDe } from "@/shared/constants/navegacion"

interface WorkspaceHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  /** Cierra la sesión; si no se provee, solo navega al login. */
  onLogout?: () => void
  /** Tipo de cuenta de la sesión ("Dueño" o "Empleado"); solo informativo. */
  etiquetaCuenta?: string
}

export function WorkspaceHeader({
  isCollapsed,
  onToggleCollapse,
  onLogout,
  etiquetaCuenta,
}: WorkspaceHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Integración real de modo claro / oscuro
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  const isDarkMode = mounted && theme === "dark"

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const [seccion, pantalla] = migasDe(pathname)
  const href = rutaDe(pathname)?.item.href ?? HOME_HREF

  const handleLogout = () => {
    if (onLogout) return onLogout()
    router.push("/login")
  }

  return (
    <div className="w-full flex flex-col shrink-0 select-none">
      <div className="flex h-11 w-full items-center justify-between gap-4 pb-3">

        {/* Zona Izquierda: Toggle + Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Abrir o cerrar menú lateral"
            className="flex size-9 items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 hover:text-[#4C0107] dark:hover:text-[#EDE5E6] hover:bg-[#EDE5E6]/60 dark:hover:bg-stone-800 transition-colors outline-none cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>

          <Breadcrumb className="truncate flex items-center">
            <BreadcrumbList className="flex items-center gap-2 text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={href} />}>
                  {seccion}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="dark:text-white">{pantalla}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Zona Derecha: Theme Switch y Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {etiquetaCuenta && (
            <span className="hidden h-9 items-center rounded-full bg-[#4C0107] px-3.5 text-xs font-semibold text-white md:inline-flex">
              {etiquetaCuenta}
            </span>
          )}


          {/* Switch activo conectado al ThemeProvider */}
          <div className="flex h-9 items-center gap-2 px-3 rounded-full bg-[#EDE5E6]/40 dark:bg-stone-800">
            <Moon className={cn("size-3.5 transition-colors", isDarkMode ? "text-slate-100" : "text-slate-400")} />
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
              aria-label="Cambiar tema"
            />
            <Sun className={cn("size-3.5 transition-colors", !isDarkMode ? "text-slate-900" : "text-slate-400")} />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            rightIcon={<LogOut className="size-4 ml-1" />}
            className="h-9 px-4 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer gap-2 shrink-0 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <span className="hidden xl:inline">CERRAR SESIÓN</span>
          </Button>
        </div>

      </div>

      {/* Divisor semántico compatible con dark mode */}
      <Separator className="h-[1px] min-h-[1px] w-full bg-[#EDE5E6] dark:bg-stone-800 shrink-0 block my-3" />
    </div>
  )
}