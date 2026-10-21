import { cache } from "react"
import { obtenerPublico } from "@/lib/api/publico"
import { ErrorApi } from "@/lib/api/error-api"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type {
  CategoriaVitrina,
  FiltrosProductosVitrina,
  ProductoDetalleVitrina,
  ProductoResumenVitrina,
  TiendaVitrina,
} from "@/dtos/vitrina"

// Formatos de la API (TIE-001 y CAT-002): lo que no cumple no puede existir y se responde 404 sin llamar a la API.
const SUBDOMINIO_VALIDO = /^[a-z0-9](-?[a-z0-9])*$/
const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/

function exigirFormato(valor: string, patron: RegExp, max: number): void {
  if (valor.length > max || !patron.test(valor)) {
    throw new ErrorApi({ estado: 404, codigo: "TIE-404", mensaje: "No encontramos lo que buscas" })
  }
}

/** Obtiene los datos públicos de una tienda por su subdominio. */
export const obtenerTienda = cache(async (subdominio: string): Promise<TiendaVitrina> => {
  exigirFormato(subdominio, SUBDOMINIO_VALIDO, 63)
  return obtenerPublico<TiendaVitrina>(`vitrina/${encodeURIComponent(subdominio)}`)
})

/** Obtiene las categorías públicas con productos publicados de una tienda. */
export const obtenerCategorias = cache(async (subdominio: string): Promise<CategoriaVitrina[]> => {
  exigirFormato(subdominio, SUBDOMINIO_VALIDO, 63)
  return obtenerPublico<CategoriaVitrina[]>(`vitrina/${encodeURIComponent(subdominio)}/categorias`)
})

/** Obtiene los productos publicados de una tienda con filtros y paginación. */
export async function obtenerProductos(
  subdominio: string,
  filtros?: FiltrosProductosVitrina
): Promise<Paginado<ProductoResumenVitrina>> {
  exigirFormato(subdominio, SUBDOMINIO_VALIDO, 63)
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
  exigirFormato(subdominio, SUBDOMINIO_VALIDO, 63)
  exigirFormato(slug, SLUG_VALIDO, 200)
  return obtenerPublico<ProductoDetalleVitrina>(
    `vitrina/${encodeURIComponent(subdominio)}/productos/${encodeURIComponent(slug)}`
  )
})
