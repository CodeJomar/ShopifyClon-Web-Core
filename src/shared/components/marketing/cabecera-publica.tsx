"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, ShoppingBag, Store } from "lucide-react"
import { ThemeToggle } from "@/shared/components/theme/theme-toggle"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet"
import { cn } from "@/shared/utils/cn"
import { useCarrito } from "@/modules/carrito-global/carrito"
import { useAcceso } from "@/modules/acceso/acceso"
import { MenuCuenta, useEnlacesCuenta } from "./menu-cuenta"
import { claseBotonContorno, claseBotonMarca, claseContenedor } from "./estilos"

const ENLACES = [
  { href: "/mercado", etiqueta: "Mercado" },
  { href: "/mercado/tiendas", etiqueta: "Tiendas" },
  { href: "/planes", etiqueta: "Vender" },
]

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="OTemu, inicio" className={cn("flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sobre-marca">
        <Store className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="text-[20px] font-extrabold tracking-tight text-foreground">OTemu</span>
    </Link>
  )
}

/** Cabecera de la zona pública: logo, navegación, búsqueda del mercado, tema y acceso. */
export function CabeceraPublica() {
  const ruta = usePathname()
  const { cantidadTotal, listo } = useCarrito()
  const { acceso } = useAcceso()
  const enlacesCuenta = useEnlacesCuenta()
  const activo = (href: string) => (href === "/mercado" ? ruta === "/mercado" || ruta.startsWith("/mercado/tienda/") : ruta.startsWith(href))
  // En la portada la cabecera flota como una pastilla de vidrio sobre la aurora (siempre en tema oscuro, para que se lea sobre cualquier fondo).
  const portada = ruta === "/"

  return (
    <header className={portada ? "fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6" : "sticky top-0 z-40 border-b border-island-border bg-background/80 backdrop-blur-xl"}>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-bold">
        Saltar al contenido
      </a>
      <div className={portada ? "mx-auto flex h-14 w-full max-w-6xl items-center gap-3 rounded-2xl border border-black/10 bg-white/85 px-4 shadow-[0_18px_50px_-24px_rgb(15_40_60/0.35),inset_0_1px_0_rgb(255_255_255/0.8)] backdrop-blur-2xl dark:border-white/12 dark:bg-black/40 dark:shadow-[0_18px_50px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.1)] lg:gap-6" : cn(claseContenedor, "flex h-16 items-center gap-3 lg:gap-6")}>
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo(e.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-[14px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40",
                activo(e.href) && "bg-primary/12 text-brand-text hover:text-brand-text",
              )}
            >
              {e.etiqueta}
            </Link>
          ))}
        </nav>

        <form action="/mercado" method="get" role="search" className={cn("ml-auto hidden max-w-sm flex-1", portada ? "hidden" : "lg:block")}>
          <label className="relative block">
            <span className="sr-only">Buscar productos en el mercado</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Buscar café, cerámica, audífonos…"
              className="h-10 w-full rounded-xl border-[1.8px] border-input bg-card pl-10 pr-3 text-[13.5px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18"
            />
          </label>
        </form>

        <div className={cn("ml-auto flex items-center gap-2", !portada && "lg:ml-0")}>
          <Link
            href="/carrito"
            aria-label={listo && cantidadTotal > 0 ? `Mi carrito, ${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"}` : "Mi carrito"}
            className="relative flex size-10 items-center justify-center rounded-xl border-[1.8px] border-input text-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <ShoppingBag className="size-[18px]" aria-hidden="true" />
            {listo && cantidadTotal > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-extrabold leading-5 text-sobre-marca">{cantidadTotal}</span>
            )}
          </Link>
          <ThemeToggle />
          <MenuCuenta />

          <Sheet>
            <SheetTrigger
              aria-label="Abrir el menú"
              className="flex size-10 items-center justify-center rounded-xl border-[1.8px] border-input text-foreground outline-none transition-colors hover:border-border-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 md:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] gap-0 p-0">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <div className="flex flex-col gap-1 p-5 pt-16">
                {ENLACES.map((e) => (
                  <SheetClose key={e.href} render={<Link href={e.href} />} className="rounded-xl px-3 py-3 text-[16px] font-bold text-foreground hover:bg-primary/10">
                    {e.etiqueta}
                  </SheetClose>
                ))}
              </div>
              {acceso.estado === "autenticado" ? (
                <div className="mt-auto flex flex-col gap-1 border-t border-border/60 p-5">
                  <p className="px-3 pb-1 text-[13px] font-semibold text-muted-foreground">{acceso.nombres} {acceso.apellidos}</p>
                  {enlacesCuenta.map((e) => (
                    <SheetClose key={e.href} render={<Link href={e.href} />} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] font-bold text-foreground hover:bg-primary/10">
                      <e.icono aria-hidden="true" className="size-4 text-brand-text" />
                      {e.etiqueta}
                    </SheetClose>
                  ))}
                </div>
              ) : (
                <div className="mt-auto flex flex-col gap-2.5 border-t border-border/60 p-5">
                  <SheetClose render={<Link href="/login" />} className={cn(claseBotonContorno, "w-full")}>
                    Iniciar sesión
                  </SheetClose>
                  <SheetClose render={<Link href="/registro" />} className={cn(claseBotonMarca, "w-full")}>
                    Crear cuenta
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
