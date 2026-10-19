"use client"

import * as React from "react"
import { SearchX } from "lucide-react"

import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { SearchInput } from "@/shared/components/composed/search-input"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { usePaginacionAjustada } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"

import type { useCatalogoPos } from "../hooks/use-catalogo-pos"
import { FILTRO_TODOS, type ProductoPos } from "../schema"
import { CatalogoSkeleton } from "./catalogo-skeleton"
import { CategoriaChips } from "@/shared/components/composed/categoria-chips"
import { panelClass } from "./estilos"
import { ProductoCard } from "./producto-card"

interface CatalogoPanelProps {
  catalogo: ReturnType<typeof useCatalogoPos>
  /** Unidades de cada producto que ya están en la comanda. */
  cantidades: ReadonlyMap<string, number>
  puedeCrear: boolean
  busquedaRef: React.Ref<HTMLInputElement>
  onSeleccionar: (producto: ProductoPos) => void
  /** Título del POS y selector de vista, que van arriba del buscador. */
  encabezado: React.ReactNode
}

// Alto fijo de cada tarjeta de producto (foto + datos)
const ALTO_PRODUCTO = 176

/** Catálogo del POS: buscador, categorías y cuadrícula de productos con paginación. */
export function CatalogoPanel({ catalogo, cantidades, puedeCrear, busquedaRef, onSeleccionar, encabezado }: CatalogoPanelProps) {
  const { categorias, productos, productosFiltrados, busqueda, setBusqueda, categoria, setCategoria, isLoading, error, recargar } = catalogo
  // Cuántas tarjetas caben se calcula con el espacio disponible: el catálogo no hace scroll, solo se pagina
  const paginacion = usePaginacionAjustada(productosFiltrados, { altoItem: ALTO_PRODUCTO, anchoMinimo: 190, gap: 12, clave: `${busqueda}|${categoria}` })

  return (
    <section className={cn(panelClass, "flex h-full min-h-0 min-w-0 flex-col gap-3.5 p-4 lg:p-5")} aria-label="Catálogo de productos">
      {encabezado}

      <SearchInput
        ref={busquedaRef}
        id="pos-buscar-producto"
        value={busqueda}
        onValueChange={setBusqueda}
        placeholder="Buscar producto…"
        atajo="/"
      />

      {!isLoading && <CategoriaChips categorias={categorias} productos={productos} activa={categoria} onChange={setCategoria} idPrefijo="pos-categoria" />}

      {error ? (
        <EstadoError mensaje={error} onReintentar={recargar} />
      ) : isLoading ? (
        <CatalogoSkeleton />
      ) : productosFiltrados.length === 0 ? (
        <EstadoVacio
          icono={SearchX}
          titulo="Sin productos"
          descripcion="No se encontraron productos con ese criterio."
          accion={{
            texto: "Limpiar filtros",
            onClick: () => {
              setBusqueda("")
              setCategoria(FILTRO_TODOS)
            },
          }}
        />
      ) : (
        <>
          <GrillaAjustada paginacion={paginacion} etiqueta="Productos">
            {paginacion.visibles.map((producto) => (
              <li key={producto.id_producto} className="min-h-0">
                <ProductoCard
                  producto={producto}
                  cantidad={cantidades.get(producto.id_producto) ?? 0}
                  deshabilitado={!puedeCrear}
                  onSeleccionar={onSeleccionar}
                />
              </li>
            ))}
          </GrillaAjustada>
          <BarraPaginacion paginacion={paginacion} etiqueta="productos" />
        </>
      )}
    </section>
  )
}
