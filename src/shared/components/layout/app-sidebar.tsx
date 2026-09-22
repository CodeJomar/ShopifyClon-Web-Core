"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ReceiptText,
  Refrigerator,
  UtensilsCrossed,
  Store,
  FileText,
  Users,
  ShieldCheck,
  Grid2X2,
  Coins,
  Clock,
  Coffee
} from "lucide-react"

import { SidebarNavItem } from "@/shared/components/composed/sidebar-nav-item"
import { SidebarNavGroup } from "@/shared/components/composed/sidebar-nav-group"
import { UserProfile } from "@/shared/components/composed/user-profile"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/utils/cn"

interface AppSidebarProps {
  isCollapsed?: boolean
  className?: string
}

export function AppSidebar({ isCollapsed = false, className }: AppSidebarProps) {
  const pathname = usePathname()

  const userName = "Jomar Peralta"
  const userRole = "Administrador"
  const userInitials = "JP"

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-between overflow-hidden",
        isCollapsed ? "items-center px-0" : "px-1",
        className
      )}
    >
      {/* Zona Superior: Marca y Navegación */}
      <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar w-full">

        {/* Cabecera / Marca con Avatar y Separador */}
        <div className={cn("w-full flex flex-col gap-3", isCollapsed && "items-center")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center pt-1 rounded-2xl transition-opacity hover:opacity-90 outline-none select-none cursor-pointer"
                  >
                    <Avatar className="size-12 shrink-0 border-none">
                      <AvatarFallback className="bg-[#4C0107] text-white">
                        <Coffee className="size-6" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                }
              />
              <TooltipContent side="right">Inicio</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 pt-1 px-2 rounded-2xl transition-opacity hover:opacity-90 outline-none select-none cursor-pointer"
            >
              <Avatar className="size-12 shrink-0 border-none">
                <AvatarFallback className="bg-[#4C0107] text-white">
                  <Coffee className="size-6" />
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col overflow-hidden">
                <span className="font-display text-base font-bold leading-tight text-slate-900 dark:text-stone-100 truncate">
                  Coffy Flow
                </span>
                <span className="text-xs text-slate-500 dark:text-stone-400 truncate">
                  Cafetería Empresarial
                </span>
              </div>
            </Link>
          )}

          {/* Separador superior del UI Kit */}
          <Separator className="bg-[#EDE5E6] dark:bg-[#373232]" />
        </div>

        {/* Enlaces del Menú */}
        <nav className="flex flex-col gap-1.5 w-full">
          {isCollapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger render={
                  <Link href="/dashboard" className="w-full flex justify-center cursor-pointer">
                    <SidebarNavItem icon={<LayoutDashboard />} isActive={pathname === "/dashboard"} />
                  </Link>
                } />
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <Link href="/pos" className="w-full flex justify-center cursor-pointer">
                    <SidebarNavItem icon={<ReceiptText />} isActive={pathname === "/pos"} />
                  </Link>
                } />
                <TooltipContent side="right">POS</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <Link href="/kds" className="w-full flex justify-center cursor-pointer">
                    <SidebarNavItem icon={<Refrigerator />} isActive={pathname === "/kds"} />
                  </Link>
                } />
                <TooltipContent side="right">KDS</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <Link href="/menu" className="w-full flex justify-center cursor-pointer">
                    <SidebarNavItem icon={<UtensilsCrossed />} isActive={pathname === "/menu"} />
                  </Link>
                } />
                <TooltipContent side="right">Menú</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <div className="w-full flex justify-center cursor-pointer">
                    <SidebarNavItem icon={<Store />} />
                  </div>
                } />
                <TooltipContent side="right">Local y Equipo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={
                  <div className="w-full flex justify-center cursor-pointer">
                    <SidebarNavItem icon={<FileText />} />
                  </div>
                } />
                <TooltipContent side="right">Transacciones</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="w-full cursor-pointer">
                <SidebarNavItem icon={<LayoutDashboard />} isActive={pathname === "/dashboard"}>
                  Dashboard
                </SidebarNavItem>
              </Link>

              <Link href="/pos" className="w-full cursor-pointer">
                <SidebarNavItem icon={<ReceiptText />} isActive={pathname === "/pos"}>
                  POS
                </SidebarNavItem>
              </Link>

              <Link href="/kds" className="w-full cursor-pointer">
                <SidebarNavItem icon={<Refrigerator />} isActive={pathname === "/kds"}>
                  KDS
                </SidebarNavItem>
              </Link>

              <Link href="/menu" className="w-full cursor-pointer">
                <SidebarNavItem icon={<UtensilsCrossed />} isActive={pathname === "/menu"}>
                  Menú
                </SidebarNavItem>
              </Link>

              <SidebarNavGroup
                title="Local y Equipo"
                icon={<Store />}
                items={[
                  { title: "Gestión de Empleados", icon: <Users /> },
                  { title: "Roles y Permisos", icon: <ShieldCheck /> },
                  { title: "Gestión de Mesas", icon: <Grid2X2 /> },
                ]}
              />

              <SidebarNavGroup
                title="Transacciones"
                icon={<FileText />}
                items={[
                  { title: "Gestión de cajas", icon: <Coins /> },
                  { title: "Historial de Pedidos", icon: <Clock /> },
                ]}
              />
            </>
          )}
        </nav>
      </div>

      {/* Zona Inferior: Separador y Perfil de Usuario */}
      <div className={cn("w-full flex flex-col gap-4 pt-2 shrink-0", isCollapsed && "items-center")}>
        <Separator className="bg-[#EDE5E6] dark:bg-[#373232]" />

        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger render={
              <button type="button" className="outline-none focus:outline-none cursor-pointer">
                <Avatar className="size-10">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            } />
            <TooltipContent side="right">{`${userName} (${userRole})`}</TooltipContent>
          </Tooltip>
        ) : (
          <UserProfile name={userName} role={userRole} initials={userInitials} className="cursor-pointer" />
        )}
      </div>
    </div>
  )
}