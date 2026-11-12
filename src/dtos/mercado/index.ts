// Contrato del mercado público (propuesta B1 de docs/rediseno/01-necesidades-backend.md, snake_case).
// Mientras el backend no lo ofrezca, `src/modules/mercado/datos/` los entrega desde mocks con esta misma forma.

export type IconoCategoria = "cafe" | "hogar" | "moda" | "tecnologia" | "belleza" | "arte"

export interface CategoriaMercado {
  id: string
  nombre: string
  icono: IconoCategoria
  total_productos: number
}

/** Tienda visible en el mercado (activa, operativa y con al menos un producto publicado). */
export interface TiendaMercado {
  id: string
  nombre: string
  subdominio: string
  descripcion: string
  ciudad: string
  /** Matiz 0–360 con el que se pinta su avatar y la portada mientras no haya imagen. */
  tono: number
  total_productos: number
  /** Desde cuándo vende en OTemu (año). */
  desde: number
}

export interface ProductoMercado {
  id: string
  slug: string
  titulo: string
  descripcion: string
  precio: number
  precio_comparacion?: number | null
  moneda: string
  categoria_id: string
  es_digital: boolean
  disponible: boolean
  /** Promedio 0–5 y cantidad de reseñas (mock: el backend aún no tiene reseñas). */
  calificacion: number
  resenas: number
  tienda: Pick<TiendaMercado, "id" | "nombre" | "subdominio" | "tono">
  /** Ciudad desde la que despacha la tienda. */
  despacha_desde: string
}

export type OrdenProductos = "recientes" | "precio_asc" | "precio_desc"

export interface FiltrosProductos {
  q?: string
  categoria?: string
  tienda?: string
  orden?: OrdenProductos
  pagina?: number
  por_pagina?: number
}

export interface PaginaProductos {
  datos: ProductoMercado[]
  total: number
  pagina: number
  por_pagina: number
  total_paginas: number
}

/** Plan de suscripción para quien quiere vender (GET /planes). */
export interface PlanMercado {
  codigo: string
  nombre: string
  precio_mensual: number
  moneda: string
  limite_tiendas: number
  limite_productos: number | null
  comision: number
  destacado: boolean
  incluye: string[]
}
