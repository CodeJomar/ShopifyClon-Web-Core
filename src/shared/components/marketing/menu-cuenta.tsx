"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, LogIn, LogOut, Receipt, ShieldCheck, Store, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { cerrarSesionAction } from "@/modules/auth"
import { useAcceso } from "@/modules/acceso/acceso"

/** Entradas del menú de la persona según lo que sea: comprador, propietario y/o administrador. */
export function useEnlacesCuenta() {
  const { acceso } = useAcceso()
  if (acceso.estado !== "autenticado") return []
  return [
    { href: "/mis-pedidos", etiqueta: "Mis pedidos", icono: Receipt },
    { href: "/cuenta", etiqueta: "Mi cuenta", icono: User },
    acceso.esPropietario
      ? { href: "/propietario", etiqueta: "Panel general", icono: LayoutDashboard }
      : { href: "/planes", etiqueta: "Vender en OTemu", icono: Store },
    ...(acceso.esAdministrador ? [{ href: "/plataforma", etiqueta: "Administración", icono: ShieldCheck }] : []),
  ]
}

/** Zona derecha de la cabecera: botones de acceso para quien no inició sesión, menú de la persona para quien sí. */
export function MenuCuenta() {
  const router = useRouter()
  const { acceso, recargar } = useAcceso()
  const enlaces = useEnlacesCuenta()

  if (acceso.estado === "cargando") return <span aria-hidden="true" className="hidden h-10 w-44 sm:block" />

  if (acceso.estado === "anonimo") {
    // Un solo icono de acceso: lleva a la pantalla de acceso (login); desde ahí se llega a «Crear cuenta».
    return (
      <Link
        href="/login"
        aria-label="Iniciar sesión o crear cuenta"
        title="Iniciar sesión"
        className="flex size-10 items-center justify-center rounded-xl border-[1.8px] border-input text-foreground outline-none transition-colors hover:border-primary hover:text-brand-text focus-visible:border-primary"
      >
        <LogIn className="size-[18px]" aria-hidden="true" />
      </Link>
    )
  }

  const iniciales = `${acceso.nombres.charAt(0)}${acceso.apellidos.charAt(0)}`.toUpperCase() || "U"
  const cerrar = async () => {
    await cerrarSesionAction()
    recargar()
    router.replace("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menú de tu cuenta"
        className="hidden items-center gap-2.5 rounded-xl py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:flex"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-[13px] font-extrabold text-sobre-marca">{iniciales}</span>
        <span className="max-w-32 truncate text-[14px] font-bold text-foreground">{acceso.nombres.split(" ")[0]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 pb-2 pt-2.5">
          <p className="truncate text-[14px] font-extrabold text-foreground">
            {acceso.nombres} {acceso.apellidos}
          </p>
          <p className="truncate text-[12.5px] text-muted-foreground">{acceso.correo}</p>
        </div>
        {enlaces.map((e) => (
          <DropdownMenuItem key={e.href} render={<Link href={e.href} />} className="gap-2.5">
            <e.icono aria-hidden="true" className="size-4 text-brand-text" />
            {e.etiqueta}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={cerrar} className="gap-2.5">
          <LogOut aria-hidden="true" className="size-4 text-muted-foreground" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
