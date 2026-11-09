import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowRight, Package, Sparkles, ShoppingBag, ShieldCheck } from "lucide-react"

import { esErrorApi } from "@/lib/api/error-api"
import {
  obtenerCategorias,
  obtenerProductos,
  obtenerTienda,
} from "@/modules/vitrina/actions/vitrina.actions"
import { TarjetaProducto } from "@/modules/vitrina/components/tarjeta-producto"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Button, buttonVariants } from "@/shared/components/ui/button"

interface PortadaPageProps {
  params: Promise<{ subdominio: string }>
}

export async function generateMetadata({ params }: PortadaPageProps): Promise<Metadata> {
  const { subdominio } = await params

  try {
    const tienda = await obtenerTienda(subdominio)
    return {
      title: `${tienda.nombre} · OTemu`,
      description: `Visita el catálogo de productos de ${tienda.nombre} en OTemu.`,
      openGraph: {
        title: `${tienda.nombre} · OTemu`,
        description: `Visita el catálogo de productos de ${tienda.nombre} en OTemu.`,
        type: "website",
      },
    }
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) {
      notFound()
    }
    return {
      title: "Tienda · OTemu",
    }
  }
}

export default async function PortadaVitrinaPage({ params }: PortadaPageProps) {
  const { subdominio } = await params

  let tienda
  try {
    tienda = await obtenerTienda(subdominio)
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) {
      notFound()
    }
    throw error
  }

  const [categorias, productosPaginados] = await Promise.all([
    obtenerCategorias(subdominio).catch(() => []),
    obtenerProductos(subdominio, { pagina: 0, orden: "recientes" }).catch(() => ({
      datos: [],
      total: 0,
      pagina_actual: 0,
      tamano_pagina: 20,
      total_paginas: 0,
      tiene_mas_paginas: false,
      marca_tiempo: new Date().toISOString(),
    })),
  ])

  const productos = productosPaginados.datos

  return (
    <div className="otemu-store-home flex flex-col gap-10">
      {/* Portada de la tienda */}
      <section className="otemu-store-hero relative overflow-hidden rounded-3xl border border-island-border bg-card p-6 shadow-isla sm:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/18 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-info/12 blur-3xl" />
        <div className="otemu-store-hero-copy relative flex max-w-2xl flex-col gap-5">
          <span className="otemu-shop-kicker"><Sparkles className="size-3.5" aria-hidden="true"/> UNA TIENDA PARA DESCUBRIR</span>
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-[24px] font-extrabold text-primary-foreground [text-shadow:0_1px_2px_rgb(0_0_0/.14)]" aria-hidden="true">
            {tienda.nombre.trim()[0]?.toUpperCase() ?? "T"}
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">{tienda.nombre}</h1>
            <p className="text-[15px] text-muted-foreground sm:text-base">Descubre lo nuevo de la tienda y compra en pocos pasos.</p>
          </div>
          <div className="otemu-shop-trust flex flex-wrap gap-4 text-sm font-medium text-foreground/70">
            <span className="flex items-center gap-2"><ShoppingBag className="size-4 text-brand-text" /> Explora a tu ritmo</span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-text" /> Compra en pocos pasos</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/tienda/${subdominio}/productos`} className={buttonVariants({ variant: "default", size: "lg" })}>
              Explorar catálogo
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="otemu-store-hero-art" aria-hidden="true">
          <div className="otemu-shop-art-orbit otemu-shop-art-orbit-one" />
          <div className="otemu-shop-art-orbit otemu-shop-art-orbit-two" />
          <div className="otemu-shop-art-card"><span className="otemu-shop-art-mini">OTemu</span><ShoppingBag className="size-20" strokeWidth={1.1}/><span>Tu próxima compra</span></div>
        </div>
      </section>

      {/* Categorías */}
      {categorias.length > 0 && (
        <section aria-labelledby="titulo-categorias" className="flex flex-col gap-3">
          <h2 id="titulo-categorias" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Compra por categoría</h2>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
            {categorias.map((cat) => (
              <Link
                key={cat.identificador_url}
                href={`/tienda/${subdominio}/productos?categoria=${cat.identificador_url}`}
                className="shrink-0 whitespace-nowrap rounded-full border-[1.8px] border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground outline-none transition-colors hover:border-primary hover:bg-primary/10 hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/25"
              >
                {cat.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos recientes */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Productos recientes
            </h2>
            <p className="text-xs text-muted-foreground">
              Lo más nuevo publicado en nuestra tienda
            </p>
          </div>

          <Link href={`/tienda/${subdominio}/productos`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <span>Ver catálogo</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {productos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-isla">
            <EstadoVacio
              titulo="No encontramos productos"
              descripcion="Aún no hay productos publicados en esta tienda."
              icono={Package}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-6">
            {productos.map((prod) => (
              <TarjetaProducto
                key={prod.identificador_url}
                producto={prod}
                subdominio={subdominio}
                moneda={tienda.moneda}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
