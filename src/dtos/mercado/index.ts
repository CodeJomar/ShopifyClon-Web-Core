// Contrato del mercado público (B1 del backend, `GET /mercado/...`, snake_case). Son los nombres reales que entrega la API.
import type { PlanDto } from "@/dtos/tienda"

export interface CategoriaMercado {
  nombre: string
  slug: string
  cantidad_productos: number
}

/** Tienda visible en el mercado: operativa, con `visible_en_mercado` y al menos un producto publicado con imagen. */
export interface TiendaMercado {
  nombre: string
  subdominio: string
  descripcion?: string | null
  logo_url?: string | null
  moneda: string
  cantidad_productos: number
  /** Solo en el detalle de la tienda. */
  categorias?: CategoriaMercado[]
}

export interface ProductoMercado {
  id: string
  titulo: string
  identificador_url: string
  precio_desde: number
  precio_comparacion_desde?: number | null
  moneda: string
  imagen_url?: string | null
  es_digital: boolean
  hay_stock: boolean
  tienda: Pick<TiendaMercado, "nombre" | "subdominio"> & { logo_url?: string | null }
}

export type OrdenProductos = "recientes" | "precio_asc" | "precio_desc"

export interface FiltrosProductos {
  q?: string
  categoria?: string
  tienda?: string
  precio_min?: number
  precio_max?: number
  orden?: OrdenProductos
  /** Empieza en 0, como toda la API. */
  pagina?: number
  tamano?: number
}

export interface PaginaMercado<T> {
  datos: T[]
  total: number
  pagina_actual: number
  tamano_pagina: number
  total_paginas: number
}

export interface DestacadosMercado {
  tiendas: TiendaMercado[]
  productos: ProductoMercado[]
  resumen: { tiendas: number; productos: number }
}

/** Plan de suscripción para quien quiere vender (GET /planes); desde B3 trae `es_gratuito`. */
export type PlanMercado = PlanDto & { es_gratuito?: boolean }
