import type { Dinero } from "@/dtos/core/dinero"

/** Tienda pública de la vitrina (GET /vitrina/{subdominio}). TIE-009 */
export interface TiendaVitrina {
  nombre: string
  subdominio: string
  moneda: string
  correo_contacto: string
  precios_incluyen_impuesto: boolean
}

/** Categoría pública de la vitrina (GET /vitrina/{subdominio}/categorias). */
export interface CategoriaVitrina {
  nombre: string
  identificador_url: string
}

/** Orden de productos permitido en el catálogo. */
export type OrdenProductosVitrina = "recientes" | "precio_asc" | "precio_desc"

/** Resumen de producto para tarjetas y listado (GET /vitrina/{subdominio}/productos). CAT-011 */
export interface ProductoResumenVitrina {
  titulo: string
  identificador_url: string
  precio_minimo: Dinero | number
  precio_comparacion?: Dinero | number | null
  imagen_principal?: string | null
  disponible: boolean
}

/** Variante de un producto en el detalle. */
export interface VarianteVitrina {
  id: string
  titulo: string
  precio: Dinero | number
  precio_comparacion?: Dinero | number | null
  disponible: boolean
  requiere_envio: boolean
}

/** Imagen de un producto en el detalle. */
export interface ImagenVitrina {
  url_imagen: string
  texto_alternativo?: string | null
  variante_id?: string | null
  posicion: number
}

/** Detalle completo de un producto (GET /vitrina/{subdominio}/productos/{slug}). */
export interface ProductoDetalleVitrina {
  titulo: string
  identificador_url: string
  descripcion?: string | null
  categorias: CategoriaVitrina[]
  variantes: VarianteVitrina[]
  imagenes: ImagenVitrina[]
}

/** Filtros para consultar productos en la vitrina. */
export interface FiltrosProductosVitrina {
  pagina?: number
  texto?: string
  categoria?: string
  orden?: OrdenProductosVitrina
}
