import { notFound } from "next/navigation"
import type { Metadata } from "next"

import type { OrdenProductosVitrina } from "@/dtos/vitrina"
import { esErrorApi } from "@/lib/api/error-api"
import {
  obtenerCategorias,
  obtenerProductos,
  obtenerTienda,
} from "@/modules/vitrina/actions/vitrina.actions"
import { FiltrosCatalogo } from "@/modules/vitrina/components/filtros-catalogo"
import { PaginacionCatalogo } from "@/modules/vitrina/components/paginacion-catalogo"
import { TarjetaProducto } from "@/modules/vitrina/components/tarjeta-producto"
import { EstadoVacioCatalogo } from "@/modules/vitrina/components/estado-vacio-catalogo"

interface CatalogoPageProps {
  params: Promise<{ subdominio: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CatalogoPageProps): Promise<Metadata> {
  const { subdominio } = await params

  try {
    const tienda = await obtenerTienda(subdominio)
    return {
      title: `Catálogo · ${tienda.nombre}`,
      description: `Explora el catálogo completo de ${tienda.nombre} en OTemu.`,
      openGraph: {
        title: `Catálogo · ${tienda.nombre}`,
        description: `Explora el catálogo completo de ${tienda.nombre} en OTemu.`,
      },
    }
  } catch {
    return {
      title: "Catálogo de productos · OTemu",
    }
  }
}

export default async function CatalogoVitrinaPage({ params, searchParams }: CatalogoPageProps) {
  const { subdominio } = await params
  const query = await searchParams

  let tienda
  try {
    tienda = await obtenerTienda(subdominio)
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) {
      notFound()
    }
    throw error
  }

  const texto = typeof query.texto === "string" ? query.texto : undefined
  const categoria = typeof query.categoria === "string" ? query.categoria : undefined
  const orden = (typeof query.orden === "string" ? query.orden : "recientes") as OrdenProductosVitrina
  const pagina = query.pagina ? Math.max(0, parseInt(String(query.pagina), 10) || 0) : 0

  const [categorias, paginado] = await Promise.all([
    obtenerCategorias(subdominio).catch(() => []),
    obtenerProductos(subdominio, { pagina, texto, categoria, orden }).catch(() => ({
      datos: [],
      total: 0,
      pagina_actual: 0,
      tamano_pagina: 20,
      total_paginas: 0,
      tiene_mas_paginas: false,
      marca_tiempo: new Date().toISOString(),
    })),
  ])

  const tieneFiltros = Boolean(texto || categoria || (orden && orden !== "recientes"))
  const productos = paginado.datos

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado del catálogo */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Catálogo de productos
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Encuentra todos los productos disponibles en {tienda.nombre}
        </p>
      </div>

      {/* Barra de filtros (búsqueda, categorías, orden) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-isla">
        <FiltrosCatalogo
          categorias={categorias}
          textoInicial={texto ?? ""}
          categoriaInicial={categoria ?? ""}
          ordenInicial={orden}
        />
      </div>

      {/* Listado de productos o estado vacío */}
      {productos.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-isla">
          <EstadoVacioCatalogo subdominio={subdominio} tieneFiltros={tieneFiltros} />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
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

          {/* Barra de paginación */}
          <PaginacionCatalogo
            paginaActual={paginado.pagina_actual}
            totalPaginas={paginado.total_paginas}
            total={paginado.total}
            porPagina={paginado.tamano_pagina}
            className="rounded-2xl border border-border bg-card p-4 shadow-isla"
          />
        </div>
      )}
    </div>
  )
}
