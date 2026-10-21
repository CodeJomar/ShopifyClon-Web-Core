// src/shared/components/layout/workspace-header.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeftClose, PanelLeftOpen, LogOut, Settings, User } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Separator } from "@/shared/components/ui/separator"
import { UserProfile } from "@/shared/components/composed/user-profile"
import { HOME_HREF, PERFIL_HREF, migasDe, rutaDe } from "@/shared/constants/navegacion"

interface WorkspaceHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  /** Cierra la sesión y lleva a /login. */
  onLogout: () => void
  /** Persona autenticada (menú del usuario, a la derecha). */
  userName: string
  userRole?: string
  userInitials?: string
  /** Muestra "Configuración" en el menú del usuario (rol con TIENDA_CONFIGURAR y tienda activa). */
  puedeConfigurar?: boolean
}

export function WorkspaceHeader({
  isCollapsed,
  onToggleCollapse,
  onLogout,
  userName,
  userRole = "",
  userInitials,
  puedeConfigurar = false,
}: WorkspaceHeaderProps) {
  const pathname = usePathname()

  const [seccion, pantalla] = migasDe(pathname)
  const href = rutaDe(pathname)?.item.href ?? (pathname.startsWith(PERFIL_HREF) ? PERFIL_HREF : HOME_HREF)

  return (
    <div className="w-full flex flex-col shrink-0 select-none">
      <div className="flex h-11 w-full items-center justify-between gap-4 pb-3">

        {/* Zona Izquierda: Toggle + Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Abrir o cerrar menú lateral"
            className="flex size-9 items-center justify-center rounded-xl text-foreground  hover:text-brand-text  hover:bg-brand-strong/12  transition-colors outline-none cursor-pointer shrink-0"
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

        {/* Zona Derecha: menú del usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Menú de la cuenta"
            className="group flex h-11 shrink-0 cursor-pointer items-center rounded-full px-1.5 py-1 outline-none transition-colors hover:bg-primary/12 focus-visible:ring-[3px] focus-visible:ring-ring/25 data-popup-open:bg-primary/12 sm:px-2.5"
          >
            <UserProfile name={userName} role={userRole} initials={userInitials} compacto chevron />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuItem render={<Link href={PERFIL_HREF} />}>
              <User aria-hidden="true" className="size-4" />
              Ver perfil
            </DropdownMenuItem>
            {puedeConfigurar && (
              <DropdownMenuItem render={<Link href="/panel/configuracion" />}>
                <Settings aria-hidden="true" className="size-4" />
                Configuración
              </DropdownMenuItem>
            )}
            <div role="separator" className="my-1.5 h-px bg-border" />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive-text focus:bg-destructive/9 focus:text-destructive-text"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Divisor semántico compatible con dark mode */}
      <Separator className="h-[1px] min-h-[1px] w-full bg-brand-strong/12  shrink-0 block my-3" />
    </div>
  )
}
