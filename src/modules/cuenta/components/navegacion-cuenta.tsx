"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MapPin, Receipt, Store, User } from "lucide-react"
import { useAcceso } from "@/modules/acceso/acceso"
import { cn } from "@/shared/utils/cn"

/**
 * Menú de «Mi cuenta» de la zona pública: una tira horizontal de pestañas sobre el contenido (sin columna lateral), igual en todas las
 * pantallas de la cuenta, el panel general y «Mis pedidos». Solo se muestra con sesión iniciada. Quien ya es propietario ve «Panel
 * general» y «Mis tiendas»; quien no, «Vender en OTemu».
 */
export function NavegacionCuenta() {
  const ruta = usePathname()
  const { acceso } = useAcceso()
  if (acceso.estado !== "autenticado") return null
  const esPropietario = acceso.esPropietario

  const enlaces = [
    { href: "/cuenta", etiqueta: "Mi cuenta", icono: User, activo: ruta === "/cuenta" },
    { href: "/cuenta/direcciones", etiqueta: "Direcciones", icono: MapPin, activo: ruta.startsWith("/cuenta/direcciones") },
    { href: "/mis-pedidos", etiqueta: "Mis pedidos", icono: Receipt, activo: ruta.startsWith("/mis-pedidos") || ruta.startsWith("/cuenta/ordenes") },
    ...(esPropietario
      ? [
          { href: "/propietario", etiqueta: "Panel general", icono: LayoutDashboard, activo: ruta.startsWith("/propietario") },
          { href: "/cuenta/tiendas", etiqueta: "Mis tiendas", icono: Store, activo: ruta.startsWith("/cuenta/tiendas") },
        ]
      : [{ href: "/planes", etiqueta: "Vender en OTemu", icono: Store, activo: false }]),
  ]

  return (
    <nav aria-label="Mi cuenta" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
      <ul className="flex gap-1.5">
        {enlaces.map(({ href, etiqueta, icono: Icono, activo }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[14px] font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                activo ? "bg-primary/14 text-brand-text" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icono aria-hidden="true" className="size-[18px] shrink-0" />
              {etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
