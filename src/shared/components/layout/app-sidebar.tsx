"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Store } from "lucide-react"

import { HOME_HREF, PERFIL_HREF, type NavItem } from "@/shared/constants/navegacion"
import { SidebarNavItem } from "@/shared/components/composed/sidebar-nav-item"
import { SidebarNavGroup } from "@/shared/components/composed/sidebar-nav-group"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/utils/cn"

interface AppSidebarProps {
  /** Menú que puede ver este usuario (ya filtrado por permisos con `filtrarNavegacion`). */
  items: NavItem[]
  isCollapsed?: boolean
  className?: string
  /** Nombre de la tienda activa; sin tienda, "OTemu". */
  nombreMarca?: string
  /** Con tienda activa se muestra el enlace "Cambiar de tienda" y la marca lleva al panel. */
  tieneTienda?: boolean
}

export function AppSidebar({ items, isCollapsed = false, className, nombreMarca = "OTemu", tieneTienda = false }: AppSidebarProps) {
  const pathname = usePathname()
  // Sin tienda activa /panel redirige a elegir tienda: la marca lleva a la cuenta para no rebotar.
  const homeHref = tieneTienda ? HOME_HREF : PERFIL_HREF

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        isCollapsed ? "items-center px-0" : "px-1",
        className
      )}
    >
      <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar w-full">

        {/* Marca = nombre de la tienda activa; es el enlace al home */}
        <div className={cn("w-full flex flex-col gap-3", isCollapsed && "items-center")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={homeHref}
                    aria-label={nombreMarca}
                    className="flex items-center justify-center pt-1 rounded-2xl transition-opacity hover:opacity-90 outline-none select-none cursor-pointer"
                  >
                    <Avatar className="size-12 shrink-0 border-none">
                      <AvatarFallback className="bg-primary text-white">
                        <Store className="size-6" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                }
              />
              <TooltipContent side="right">{nombreMarca}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 pt-1 px-2">
              <Link href={homeHref} aria-label={nombreMarca} className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/25">
                <Avatar className="size-12 border-none">
                  <AvatarFallback className="bg-primary text-white">
                    <Store className="size-6" />
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex min-w-0 flex-col">
                <Link href={homeHref} className="truncate rounded-md text-base font-extrabold leading-tight text-foreground outline-none hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/25">
                  {nombreMarca}
                </Link>
                {tieneTienda && (
                  <Link href="/cuenta/tiendas" className="truncate rounded-md text-xs font-bold text-brand-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25">
                    Cambiar de tienda
                  </Link>
                )}
              </div>
            </div>
          )}

          <Separator className="bg-brand-strong/12 " />
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
