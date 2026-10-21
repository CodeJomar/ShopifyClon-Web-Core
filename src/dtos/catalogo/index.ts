// Contrato del catálogo de la API (Swagger, snake_case). Límites de cada campo tomados de los *Request de la API.

/** Categoría (CategoriaRequest: nombre ≤ 100, identificador_url ≤ 100, descripcion ≤ 2000). */
export interface CategoriaDto {
  id: string
  nombre: string
  identificador_url: string
  descripcion?: string | null
}

/** Elemento de la lista paginada de productos (ProductoResumenResponse). */
export interface ProductoListaDto {
  id: string
  titulo: string
  identificador_url: string
  esta_publicado: boolean
  precio_minimo?: number | null
  numero_variantes: number
  imagen_principal?: string | null
}

/** Inventario de una variante (Inventario). */
export interface InventarioDto {
  disponible: number
  reservada: number
  rastrea_inventario: boolean
  permitir_venta_sin_stock: boolean
}

/** Variante (Variante). Montos como número JSON. */
export interface VarianteDto {
  id: string
  titulo: string
  sku: string
  codigo_barras?: string | null
  precio: number
  precio_comparacion?: number | null
  costo_unitario?: number | null
  peso_gramos?: number | null
  requiere_envio: boolean
  inventario: InventarioDto
}

/** Imagen (Imagen). */
export interface ImagenDto {
  id: string
  url_imagen: string
  texto_alternativo?: string | null
  variante_id?: string | null
  posicion: number
  es_principal: boolean
}

/** Detalle del producto (ProductoDetalle). */
export interface ProductoDetalleDto {
  id: string
  titulo: string
  identificador_url: string
  descripcion?: string | null
  proveedor?: string | null
  es_digital: boolean
  esta_publicado: boolean
  categorias: { id: string; nombre: string; identificador_url: string }[]
  variantes: VarianteDto[]
  imagenes: ImagenDto[]
}
