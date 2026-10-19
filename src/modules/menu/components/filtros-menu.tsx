"use client"

import { CategoriaChips } from "@/shared/components/composed/categoria-chips"
import { SearchInput } from "@/shared/components/composed/search-input"
import type { CategoriaMenu, FiltroCategoria } from "../schema"

/* -------------------------------------------------------------------------- */
/*                                  Filtros                                   */
/* -------------------------------------------------------------------------- */

/** Buscador y fichas de categoría, en el mismo orden y con el mismo aspecto que el catálogo del POS. */
export function Filtros({
  categorias,
  productos,
  busqueda,
  onBusqueda,
  categoria,
  onCategoria,
}: {
  categorias: CategoriaMenu[]
  productos: { id_categoria: string }[]
  busqueda: string
  onBusqueda: (valor: string) => void
  categoria: FiltroCategoria
  onCategoria: (categoria: FiltroCategoria) => void
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <SearchInput value={busqueda} onValueChange={onBusqueda} placeholder="Buscar producto..." />

      <CategoriaChips
        categorias={categorias.map((c) => ({ id: c.id_categoria, nombre: c.nombre }))}
        productos={productos}
        activa={categoria}
        onChange={onCategoria}
        idPrefijo="menu-categoria"
      />
    </div>
  )
}
