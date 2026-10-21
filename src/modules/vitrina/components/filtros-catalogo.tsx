"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import type { CategoriaVitrina, OrdenProductosVitrina } from "@/dtos/vitrina"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select"

interface FiltrosCatalogoProps {
  categorias: CategoriaVitrina[]
  textoInicial?: string
  categoriaInicial?: string
  ordenInicial?: OrdenProductosVitrina
}

export function FiltrosCatalogo({
  categorias,
  textoInicial = "",
  categoriaInicial = "",
  ordenInicial = "recientes",
}: FiltrosCatalogoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [texto, setTexto] = React.useState(textoInicial)
  const [prevTextoInicial, setPrevTextoInicial] = React.useState(textoInicial)

  if (textoInicial !== prevTextoInicial) {
    setPrevTextoInicial(textoInicial)
    setTexto(textoInicial)
  }

  const aplicarFiltros = (nuevos: {
    texto?: string
    categoria?: string
    orden?: string
    limpiarPagina?: boolean
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (nuevos.texto !== undefined) {
      if (nuevos.texto.trim()) {
        params.set("texto", nuevos.texto.trim())
      } else {
        params.delete("texto")
      }
    }

    if (nuevos.categoria !== undefined) {
      if (nuevos.categoria.trim()) {
        params.set("categoria", nuevos.categoria.trim())
      } else {
        params.delete("categoria")
      }
    }

    if (nuevos.orden !== undefined) {
      if (nuevos.orden && nuevos.orden !== "recientes") {
        params.set("orden", nuevos.orden)
      } else {
        params.delete("orden")
      }
    }

    // Reiniciar a la primera página al cambiar filtros
    params.delete("pagina")

    const query = params.toString() ? `?${params.toString()}` : ""
    router.push(`${pathname}${query}`)
  }

  const manejarBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    aplicarFiltros({ texto })
  }

  const limpiarTexto = () => {
    setTexto("")
    aplicarFiltros({ texto: "" })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de búsqueda y selector de orden */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={manejarBuscar} className="relative flex-1 max-w-md">
          <Input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar productos..."
            className="pr-20"
          />
          <div className="absolute right-1 top-1 flex items-center gap-1">
            {texto && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={limpiarTexto}
                title="Limpiar búsqueda"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            )}
            <Button type="submit" variant="ghost" size="icon-sm" title="Buscar">
              <Search className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="selector-orden" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Ordenar por:
          </label>
          <NativeSelect
            id="selector-orden"
            value={ordenInicial || "recientes"}
            onChange={(e) => aplicarFiltros({ orden: e.target.value })}
            className="w-48"
          >
            <NativeSelectOption value="recientes">Recientes</NativeSelectOption>
            <NativeSelectOption value="precio_asc">Precio: menor a mayor</NativeSelectOption>
            <NativeSelectOption value="precio_desc">Precio: mayor a menor</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      {/* Chips de categorías */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1" role="navigation" aria-label="Categorías">
          <Button
            type="button"
            variant={!categoriaInicial ? "default" : "neutral"}
            size="sm"
            onClick={() => aplicarFiltros({ categoria: "" })}
            className="rounded-full text-xs"
          >
            Todas
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat.identificador_url}
              type="button"
              variant={categoriaInicial === cat.identificador_url ? "default" : "neutral"}
              size="sm"
              onClick={() => aplicarFiltros({ categoria: cat.identificador_url })}
              className="rounded-full text-xs"
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
