// Acceso a los datos del mercado público desde el servidor (páginas de Next). Llama directo a la API (`API_INTERNAL_URL`): son
// rutas públicas, sin sesión ni cookies. Devuelve `null`/listas vacías si la API no responde, para que las pantallas muestren su
// estado vacío en vez de romperse.
import type {
  CategoriaMercado,
  DestacadosMercado,
  FiltrosProductos,
  PaginaMercado,
  PlanMercado,
  ProductoMercado,
  TiendaMercado,
} from "@/dtos/mercado"
import type { ProductoDetalleVitrina } from "@/dtos/vitrina"

const base = () => `${(process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")}/api/v1`

async function leer<T>(ruta: string, params: Record<string, string | number | undefined> = {}): Promise<T | null> {
  const url = new URL(`${base()}${ruta}`)
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, String(v))
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8_000) })
    if (!res.ok) return null
    return ((await res.json()) as { datos: T }).datos
  } catch {
    return null
  }
}

const PAGINA_VACIA = <T,>(): PaginaMercado<T> => ({ datos: [], total: 0, pagina_actual: 0, tamano_pagina: 24, total_paginas: 0 })

export async function listarProductos(filtros: FiltrosProductos = {}): Promise<PaginaMercado<ProductoMercado>> {
  return (await leer<PaginaMercado<ProductoMercado>>("/mercado/productos", { tamano: 12, ...filtros })) ?? PAGINA_VACIA()
}

export async function listarTiendas(q?: string): Promise<TiendaMercado[]> {
  const pagina = await leer<PaginaMercado<TiendaMercado>>("/mercado/tiendas", { q, tamano: 48 })
  return pagina?.datos ?? []
}

export async function obtenerTienda(subdominio: string): Promise<TiendaMercado | null> {
  return leer<TiendaMercado>(`/mercado/tiendas/${encodeURIComponent(subdominio)}`)
}

export async function listarCategorias(): Promise<CategoriaMercado[]> {
  return (await leer<CategoriaMercado[]>("/mercado/categorias")) ?? []
}

export async function obtenerDestacados(): Promise<DestacadosMercado> {
  return (await leer<DestacadosMercado>("/mercado/destacados")) ?? { tiendas: [], productos: [], resumen: { tiendas: 0, productos: 0 } }
}

/** Detalle de un producto: sale de la vitrina de su tienda (descripción, variantes e imágenes). */
export async function obtenerProducto(subdominio: string, slug: string): Promise<ProductoDetalleVitrina | null> {
  return leer<ProductoDetalleVitrina>(`/vitrina/${encodeURIComponent(subdominio)}/productos/${encodeURIComponent(slug)}`)
}

/** Planes para quien quiere vender; el gratuito va primero. */
export async function listarPlanes(): Promise<PlanMercado[]> {
  const planes = (await leer<PlanMercado[]>("/planes")) ?? []
  return [...planes].sort((a, b) => Number(Boolean(b.es_gratuito)) - Number(Boolean(a.es_gratuito)) || a.precio_mensual - b.precio_mensual)
}
