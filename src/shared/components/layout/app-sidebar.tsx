"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coffee } from "lucide-react"

import { HOME_HREF, PERFIL_HREF, type NavItem } from "@/shared/constants/navegacion"
import { SidebarNavItem } from "@/shared/components/composed/sidebar-nav-item"
import { SidebarNavGroup } from "@/shared/components/composed/sidebar-nav-group"
import { UserProfile } from "@/shared/components/composed/user-profile"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/utils/cn"

interface AppSidebarProps {
  /** Menú que puede ver este usuario (ya filtrado por permisos con `filtrarNavegacion`). */
  items: NavItem[]
  isCollapsed?: boolean
  className?: string
  /** Usuario autenticado (lo provee el layout del workspace). */
  userName?: string
  userRole?: string
  userInitials?: string
}

export function AppSidebar({
  items,
  isCollapsed = false,
  className,
  userName = "Usuario",
  userRole = "",
  userInitials = "US",
}: AppSidebarProps) {
  const pathname = usePathname()

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
                    href={HOME_HREF}
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
              href={HOME_HREF}
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

        {/* Enlaces del Menú (generados desde el mapa de navegación) */}
        <nav className="flex flex-col gap-1.5 w-full">
          {items.map((item) =>
            isCollapsed ? (
              <CollapsedNavLink key={item.id} item={item} pathname={pathname} />
            ) : item.hijos ? (
              <SidebarNavGroup
                key={item.id}
                title={item.label}
                icon={<item.icon />}
                defaultOpen={item.hijos.some((hijo) => estaActivo(pathname, hijo.href))}
                items={item.hijos.map((hijo) => ({
                  title: hijo.label,
                  icon: <hijo.icon />,
                  href: hijo.href,
                  isActive: estaActivo(pathname, hijo.href),
                }))}
              />
            ) : (
              <Link key={item.id} href={item.href!} className="w-full cursor-pointer">
                <SidebarNavItem icon={<item.icon />} isActive={estaActivo(pathname, item.href)}>
                  {item.label}
                </SidebarNavItem>
              </Link>
            ),
          )}
        </nav>
      </div>

      {/* Zona Inferior: Separador y Perfil de Usuario */}
      <div className={cn("w-full flex flex-col gap-4 pt-2 shrink-0", isCollapsed && "items-center")}>
        <Separator className="bg-[#EDE5E6] dark:bg-[#373232]" />

        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger render={
              <Link href={PERFIL_HREF} aria-label="Mi perfil" className="outline-none focus:outline-none cursor-pointer">
                <Avatar className="size-10">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Link>
            } />
            <TooltipContent side="right">{`${userName} (${userRole})`}</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href={PERFIL_HREF}
            aria-label="Mi perfil"
            className={cn(
              "w-full rounded-2xl p-2 transition-colors outline-none hover:bg-[#EDE5E6]/60 focus-visible:ring-2 focus-visible:ring-[#4C0107]/40 dark:hover:bg-stone-800",
              pathname === PERFIL_HREF && "bg-[#EDE5E6] dark:bg-stone-800"
            )}
          >
            <UserProfile name={userName} role={userRole} initials={userInitials} className="cursor-pointer" />
          </Link>
        )}
      </div>
    </div>
  )
}
/** ¿La URL actual pertenece a esta pantalla? (exacta o anidada) */
function estaActivo(pathname: string, href?: string): boolean {
  return Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`))
}

/** Menú colapsado: un icono con tooltip. Un grupo lleva a su primera pantalla disponible. */
function CollapsedNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const destino = item.href ?? item.hijos?.[0]?.href
  const activo = item.hijos ? item.hijos.some((hijo) => estaActivo(pathname, hijo.href)) : estaActivo(pathname, item.href)
  if (!destino) return null

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link href={destino} className="w-full flex justify-center cursor-pointer">
            <SidebarNavItem icon={<item.icon />} isActive={activo} />
          </Link>
        }
      />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}
