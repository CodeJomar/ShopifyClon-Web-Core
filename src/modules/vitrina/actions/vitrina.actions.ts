import { cache } from "react"
import { obtenerPublico } from "@/lib/api/publico"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type {
  CategoriaVitrina,
  FiltrosProductosVitrina,
  ProductoDetalleVitrina,
  ProductoResumenVitrina,
  TiendaVitrina,
} from "@/dtos/vitrina"

/** Obtiene los datos públicos de una tienda por su subdominio. */
export const obtenerTienda = cache(async (subdominio: string): Promise<TiendaVitrina> => {
  return obtenerPublico<TiendaVitrina>(`vitrina/${encodeURIComponent(subdominio)}`)
})

/** Obtiene las categorías públicas con productos publicados de una tienda. */
export const obtenerCategorias = cache(async (subdominio: string): Promise<CategoriaVitrina[]> => {
  return obtenerPublico<CategoriaVitrina[]>(`vitrina/${encodeURIComponent(subdominio)}/categorias`)
})

/** Obtiene los productos publicados de una tienda con filtros y paginación. */
export async function obtenerProductos(
  subdominio: string,
  filtros?: FiltrosProductosVitrina
): Promise<Paginado<ProductoResumenVitrina>> {
  const params = new URLSearchParams()
  if (filtros?.pagina !== undefined && filtros.pagina >= 0) {
    params.set("pagina", String(filtros.pagina))
  }
  if (filtros?.texto && filtros.texto.trim()) {
    params.set("texto", filtros.texto.trim())
  }
  if (filtros?.categoria && filtros.categoria.trim()) {
    params.set("categoria", filtros.categoria.trim())
  }
  if (filtros?.orden && filtros.orden.trim()) {
    params.set("orden", filtros.orden.trim())
  }

  const query = params.toString() ? `?${params.toString()}` : ""
  return obtenerPublico<Paginado<ProductoResumenVitrina>>(
    `vitrina/${encodeURIComponent(subdominio)}/productos${query}`
  )
}

/** Obtiene el detalle de un producto publicado por su identificador URL. */
export const obtenerProductoDetalle = cache(async (
  subdominio: string,
  slug: string
): Promise<ProductoDetalleVitrina> => {
  return obtenerPublico<ProductoDetalleVitrina>(
    `vitrina/${encodeURIComponent(subdominio)}/productos/${encodeURIComponent(slug)}`
  )
})
