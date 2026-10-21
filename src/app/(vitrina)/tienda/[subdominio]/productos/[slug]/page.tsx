import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"

import { esErrorApi } from "@/lib/api/error-api"
import {
  obtenerProductoDetalle,
  obtenerTienda,
} from "@/modules/vitrina/actions/vitrina.actions"
import { DetalleProductoInteractivo } from "@/modules/vitrina/components/detalle-producto-interactivo"

interface ProductoDetallePageProps {
  params: Promise<{ subdominio: string; slug: string }>
}

export async function generateMetadata({ params }: ProductoDetallePageProps): Promise<Metadata> {
  const { subdominio, slug } = await params

  try {
    const [tienda, producto] = await Promise.all([
      obtenerTienda(subdominio),
      obtenerProductoDetalle(subdominio, slug),
    ])

    const titulo = `${producto.titulo} · ${tienda.nombre}`
    const descripcion = producto.descripcion?.slice(0, 160) || `Comprar ${producto.titulo} en ${tienda.nombre}`
    const imagenPrincipal = producto.imagenes?.[0]?.url_imagen

    return {
      title: titulo,
      description: descripcion,
      openGraph: {
        title: titulo,
        description: descripcion,
        type: "website",
        images: imagenPrincipal ? [{ url: imagenPrincipal, alt: producto.titulo }] : [],
      },
    }
  } catch {
    return {
      title: "Producto · OTemu",
    }
  }
}

export default async function ProductoDetallePage({ params }: ProductoDetallePageProps) {
  const { subdominio, slug } = await params

  let tienda
  try {
    tienda = await obtenerTienda(subdominio)
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) {
      notFound()
    }
    throw error
  }

  let producto
  try {
    producto = await obtenerProductoDetalle(subdominio, slug)
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) {
      notFound()
    }
    throw error
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Migas de pan (Breadcrumb) simples */}
      <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href={`/tienda/${subdominio}`} className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Link href={`/tienda/${subdominio}/productos`} className="hover:text-foreground transition-colors">
          Productos
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
          {producto.titulo}
        </span>
      </nav>

      {/* Contenedor flotante con el detalle interactivo */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-isla">
        <DetalleProductoInteractivo
          producto={producto}
          subdominio={subdominio}
          moneda={tienda.moneda}
        />
      </div>
    </div>
  )
}
