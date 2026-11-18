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

/** Texto plano y corto de una descripción (quita etiquetas y espacios de más). */
function resumirTexto(texto: string | null | undefined, max = 110): string | null {
  const limpio = (texto ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (!limpio) return null
  return limpio.length > max ? `${limpio.slice(0, max - 1).trimEnd()}…` : limpio
}

/**
 * Completa cada producto de la lista con su descripción corta y sus variantes para la tarjeta. Mientras la lista de la API no los entregue,
 * se toman del detalle de cada producto (en paralelo). Si la API ya los trae, no se hace ninguna consulta extra.
 */
export async function conDetalleParaTarjeta(productos: ProductoMercado[]): Promise<ProductoMercado[]> {
  return Promise.all(
    productos.map(async (p) => {
      if (p.descripcion_corta !== undefined || p.variantes_resumen !== undefined) return p
      const d = await obtenerProducto(p.tienda.subdominio, p.identificador_url)
      if (!d) return p
      const variantes = d.variantes.map((v) => ({ titulo: v.titulo, precio: Number(v.precio) }))
      return { ...p, descripcion_corta: resumirTexto(d.descripcion), variantes_resumen: variantes.slice(0, 3), cantidad_variantes: variantes.length }
    }),
  )
}

export async function listarTiendas(filtros: { q?: string; pagina?: number; tamano?: number } = {}): Promise<PaginaMercado<TiendaMercado>> {
  return (await leer<PaginaMercado<TiendaMercado>>("/mercado/tiendas", { tamano: 12, ...filtros })) ?? PAGINA_VACIA()
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
