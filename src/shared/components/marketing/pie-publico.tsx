"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/shared/utils/cn"
import { claseContenedor } from "./estilos"
import { Logo } from "./cabecera-publica"

const COLUMNAS = [
  {
    titulo: "Comprar",
    enlaces: [
      { href: "/mercado", etiqueta: "Mercado" },
      { href: "/mercado/tiendas", etiqueta: "Tiendas" },
      { href: "/mis-pedidos", etiqueta: "Mis pedidos" },
    ],
  },
  {
    titulo: "Vender",
    enlaces: [
      { href: "/planes", etiqueta: "Planes y precios" },
      { href: "/registro", etiqueta: "Crear mi tienda" },
      { href: "/login", etiqueta: "Entrar a mi panel" },
    ],
  },
  {
    titulo: "Tu cuenta",
    enlaces: [
      { href: "/login", etiqueta: "Iniciar sesión" },
      { href: "/registro", etiqueta: "Crear cuenta" },
      { href: "/recuperar", etiqueta: "Recuperar contraseña" },
    ],
  },
]

export function PiePublico() {
  // En la portada el pie sigue la estética oscura de la página.
  const portada = usePathname() === "/"
  return (
    <footer className={cn("border-t", portada ? "relative z-10 border-black/10 bg-background/60 backdrop-blur-xl dark:border-white/10" : "mt-24 border-island-border bg-card/60")}>
      <div className={cn(claseContenedor, "grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]")}>
        <div className="max-w-xs space-y-3">
          <Logo />
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Tiendas independientes en un solo lugar: compra de varias a la vez con un solo pago, o abre la tuya gratis.
          </p>
        </div>
        {COLUMNAS.map((c) => (
          <nav key={c.titulo} aria-label={c.titulo}>
            <p className="mb-3 text-[13px] font-extrabold text-foreground">{c.titulo}</p>
            <ul className="space-y-2">
              {c.enlaces.map((e) => (
                <li key={e.etiqueta}>
                  <Link href={e.href} className="rounded text-[13.5px] font-medium text-muted-foreground outline-none transition-colors hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/40">
                    {e.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-island-border">
        <p className={cn(claseContenedor, "py-5 text-[12.5px] text-muted-foreground")}>© 2026 OTemu. Hecho en Perú.</p>
      </div>
    </footer>
  )
}
