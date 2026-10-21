import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowRight, Package } from "lucide-react"

import { esErrorApi } from "@/lib/api/error-api"
import {
  obtenerCategorias,
  obtenerProductos,
  obtenerTienda,
} from "@/modules/vitrina/actions/vitrina.actions"
import { TarjetaProducto } from "@/modules/vitrina/components/tarjeta-producto"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Button } from "@/shared/components/ui/button"

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
    <div className="flex flex-col gap-10">
      {/* Portada / Banner de la tienda */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-isla">
        <div className="max-w-2xl flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {tienda.nombre}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Bienvenido a nuestra tienda. Explora nuestros productos y novedades.
          </p>

          {/* Categorías como chips rápidos */}
          {categorias.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                Categorías:
              </span>
              {categorias.map((cat) => (
                <Link
                  key={cat.identificador_url}
                  href={`/tienda/${subdominio}/productos?categoria=${cat.identificador_url}`}
                >
                  <Button variant="neutral" size="sm" className="rounded-full text-xs">
                    {cat.nombre}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

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
