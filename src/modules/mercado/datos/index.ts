// Acceso a los datos del mercado. HOY entrega mocks (`./mock`); cuando el backend ofrezca B1 (`/mercado/...`) solo cambia este archivo:
// las pantallas dependen de estas funciones y de los tipos de `@/dtos/mercado`.
import type {
  CategoriaMercado,
  FiltrosProductos,
  PaginaProductos,
  PlanMercado,
  ProductoMercado,
  TiendaMercado,
} from "@/dtos/mercado"
import { CATEGORIAS, PLANES, PRODUCTOS, TIENDAS } from "./mock"

const sinTildes = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export async function listarProductos(filtros: FiltrosProductos = {}): Promise<PaginaProductos> {
  const { q, categoria, tienda, orden = "recientes", pagina = 1, por_pagina = 12 } = filtros
  let lista = PRODUCTOS.filter((x) => {
    if (categoria && x.categoria_id !== categoria) return false
    if (tienda && x.tienda.subdominio !== tienda) return false
    if (q) {
      const buscado = sinTildes(q)
      if (!sinTildes(`${x.titulo} ${x.descripcion} ${x.tienda.nombre}`).includes(buscado)) return false
    }
    return true
  })
  if (orden === "precio_asc") lista = [...lista].sort((a, b) => a.precio - b.precio)
  if (orden === "precio_desc") lista = [...lista].sort((a, b) => b.precio - a.precio)
  const total = lista.length
  const total_paginas = Math.max(1, Math.ceil(total / por_pagina))
  const actual = Math.min(Math.max(1, pagina), total_paginas)
  return { datos: lista.slice((actual - 1) * por_pagina, actual * por_pagina), total, pagina: actual, por_pagina, total_paginas }
}

export async function listarTiendas(q?: string): Promise<TiendaMercado[]> {
  if (!q) return TIENDAS
  const buscado = sinTildes(q)
  return TIENDAS.filter((x) => sinTildes(`${x.nombre} ${x.descripcion} ${x.ciudad}`).includes(buscado))
}

export async function obtenerTienda(subdominio: string): Promise<TiendaMercado | null> {
  return TIENDAS.find((x) => x.subdominio === subdominio) ?? null
}

export async function obtenerProducto(subdominio: string, slug: string): Promise<ProductoMercado | null> {
  return PRODUCTOS.find((x) => x.tienda.subdominio === subdominio && x.slug === slug) ?? null
}

export async function listarCategorias(): Promise<CategoriaMercado[]> {
  return CATEGORIAS
}

/** Productos y tiendas para la portada: lo más reciente y las tiendas con más productos. */
export async function obtenerDestacados(): Promise<{ productos: ProductoMercado[]; tiendas: TiendaMercado[] }> {
  return {
    productos: PRODUCTOS.filter((x) => x.disponible).slice(0, 8),
    tiendas: [...TIENDAS].sort((a, b) => b.total_productos - a.total_productos),
  }
}

export async function listarPlanes(): Promise<PlanMercado[]> {
  return PLANES
}

export { CATEGORIAS }
