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
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Switch } from "@/shared/components/ui/switch"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/utils/cn"

interface WorkspaceHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function WorkspaceHeader({
  isCollapsed,
  onToggleCollapse,
}: WorkspaceHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [selectedRole, setSelectedRole] = React.useState("dueno")

  // Integración real de modo claro / oscuro
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = mounted && theme === "dark"

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const getRouteInfo = () => {
    if (pathname.includes("/dashboard")) {
      return { parent: "Dashboard", href: "/dashboard", current: "Resumen" }
    }
    if (pathname.includes("/pos")) {
      return { parent: "Punto de Venta", href: "/pos", current: "Terminal" }
    }
    if (pathname.includes("/kds")) {
      return { parent: "KDS", href: "/kds", current: "Comandas" }
    }
    if (pathname.includes("/menu")) {
      return { parent: "Menú", href: "/menu", current: "Catálogo" }
    }
    return { parent: "Workspace", href: "/dashboard", current: "General" }
  }

  const { parent, href, current } = getRouteInfo()

  const handleLogout = () => {
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
                  {parent}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="dark:text-white">{current}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Zona Derecha: Tabs, Theme Switch y Logout */}
        <div className="flex items-center gap-3 shrink-0">
          <Tabs
            value={selectedRole}
            onValueChange={setSelectedRole}
            className="hidden md:block w-auto"
          >
            <TabsList className="h-9 items-center bg-[#EDE5E6]/40 dark:bg-stone-800 p-1 rounded-full border-none shadow-none">
              <TabsTrigger
                value="empleado"
                className="h-7 rounded-full px-3.5 text-xs font-semibold data-[state=active]:bg-[#4C0107] data-[state=active]:text-white transition-all shadow-none cursor-pointer dark:text-slate-300"
              >
                Empleado
              </TabsTrigger>
              <TabsTrigger
                value="dueno"
                className="h-7 rounded-full px-3.5 text-xs font-semibold data-[state=active]:bg-[#4C0107] data-[state=active]:text-white transition-all shadow-none cursor-pointer dark:text-slate-300"
              >
                Dueño
              </TabsTrigger>
            </TabsList>
          </Tabs>

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