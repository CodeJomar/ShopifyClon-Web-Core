import * as React from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import type { TiendaVitrina } from "@/dtos/vitrina"
import { esErrorApi } from "@/lib/api/error-api"
import { obtenerTienda } from "@/modules/vitrina/actions/vitrina.actions"
import { BuscadorHeader } from "@/modules/vitrina/components/buscador-header"
import { Button } from "@/shared/components/ui/button"

export default async function VitrinaLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdominio: string }>
}) {
  const { subdominio } = await params

  let tienda: TiendaVitrina | null = null
  try {
    tienda = await obtenerTienda(subdominio)
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) {
      // Si la tienda da 404, permitimos que el segmento renderice el not-found correspondiente
      tienda = null
    } else {
      throw error
    }
  }

  // Si no hay tienda disponible, se renderiza directamente children (que disparará not-found)
  if (!tienda) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* Encabezado de la vitrina */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Nombre de la tienda / Enlace a la portada */}
          <Link
            href={`/tienda/${subdominio}`}
            className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground hover:text-brand-text transition-colors shrink-0"
          >
            <span>{tienda.nombre}</span>
          </Link>

          {/* Buscador */}
          <div className="hidden sm:flex flex-1 justify-center max-w-sm px-2">
            <BuscadorHeader subdominio={subdominio} />
          </div>

          {/* Acceso al carrito */}
          <div className="flex items-center gap-2">
            {/* TODO(W-015): Conectar con el carrito de compras */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled
              className="relative opacity-60 cursor-not-allowed"
              title="Carrito de compras (próximamente)"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Buscador en vista móvil */}
        <div className="border-t border-border/50 px-4 py-2 sm:hidden flex justify-center bg-card">
          <BuscadorHeader subdominio={subdominio} />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      {/* Pie de página */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 max-w-6xl">
          <p>
            Hecho con{" "}
            <Link href="/" className="font-bold text-brand-text hover:underline">
              OTemu
            </Link>
          </p>
          {tienda.correo_contacto && (
            <p>
              Contacto:{" "}
              <a
                href={`mailto:${tienda.correo_contacto}`}
                className="font-medium text-foreground hover:underline"
              >
                {tienda.correo_contacto}
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
