import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { CategoriaDto, ImagenDto, ProductoDetalleDto, ProductoListaDto, VarianteDto } from "@/dtos/catalogo"

// Catálogo de la tienda activa (X-Tienda-Id lo pone el proxy). Todo pasa por /api: el JWT nunca llega al navegador.

export interface FiltrosProductos {
  texto?: string
  publicado?: boolean
  categoria_id?: string
}

// ---- Categorías ----
export const categoriasAction = () =>
  resultado(peticionApi<CategoriaDto[]>({ method: "GET", url: "/panel/catalogo/categorias" }))

export const crearCategoriaAction = (datos: { nombre: string; identificador_url?: string; descripcion?: string }) =>
  resultado(peticionApi<CategoriaDto>({ method: "POST", url: "/panel/catalogo/categorias", data: datos }))

export const editarCategoriaAction = (id: string, datos: { nombre: string; identificador_url?: string; descripcion?: string }) =>
  resultado(peticionApi<CategoriaDto>({ method: "PUT", url: `/panel/catalogo/categorias/${id}`, data: datos }))

export const eliminarCategoriaAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/catalogo/categorias/${id}` }))

// ---- Productos ----
export const productosAction = (pagina: number, filtros: FiltrosProductos) =>
  resultado(
    peticionApi<Paginado<ProductoListaDto>>({
      method: "GET",
      url: "/panel/catalogo/productos",
      params: { pagina, ...(filtros.texto ? { texto: filtros.texto } : {}), ...(filtros.publicado !== undefined ? { publicado: filtros.publicado } : {}), ...(filtros.categoria_id ? { categoria_id: filtros.categoria_id } : {}) },
    }),
  )

export const productoAction = (id: string) =>
  resultado(peticionApi<ProductoDetalleDto>({ method: "GET", url: `/panel/catalogo/productos/${id}` }))

export const crearProductoAction = (datos: {
  titulo: string
  identificador_url?: string
  descripcion?: string
  proveedor?: string
  es_digital: boolean
  categoria_ids: string[]
  variantes: Record<string, unknown>[]
}) => resultado(peticionApi<ProductoDetalleDto>({ method: "POST", url: "/panel/catalogo/productos", data: datos }))

export const editarProductoAction = (
  id: string,
  datos: { titulo: string; identificador_url?: string; descripcion?: string; proveedor?: string; es_digital: boolean },
) => resultado(peticionApi<ProductoDetalleDto>({ method: "PUT", url: `/panel/catalogo/productos/${id}`, data: datos }))

export const categoriasDeProductoAction = (id: string, categoria_ids: string[]) =>
  resultado(peticionApi<void>({ method: "PUT", url: `/panel/catalogo/productos/${id}/categorias`, data: { categoria_ids } }))

export const publicarProductoAction = (id: string, publicar: boolean) =>
  resultado(
    peticionApi<void>({ method: "POST", url: `/panel/catalogo/productos/${id}/${publicar ? "publicar" : "despublicar"}` }),
  )

export const eliminarProductoAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/catalogo/productos/${id}` }))

// ---- Variantes ----
export const crearVarianteAction = (productoId: string, datos: Record<string, unknown>) =>
  resultado(peticionApi<VarianteDto>({ method: "POST", url: `/panel/catalogo/productos/${productoId}/variantes`, data: datos }))

export const editarVarianteAction = (id: string, datos: Record<string, unknown>) =>
  resultado(peticionApi<VarianteDto>({ method: "PUT", url: `/panel/catalogo/variantes/${id}`, data: datos }))

export const eliminarVarianteAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/catalogo/variantes/${id}` }))

// ---- Imágenes (por URL; la subida de archivos está bloqueada por A-001) ----
export const crearImagenAction = (productoId: string, datos: { url_imagen: string; texto_alternativo?: string; es_principal?: boolean }) =>
  resultado(peticionApi<ImagenDto>({ method: "POST", url: `/panel/catalogo/productos/${productoId}/imagenes`, data: datos }))

export const editarImagenAction = (id: string, datos: { url_imagen: string; texto_alternativo?: string; es_principal?: boolean }) =>
  resultado(peticionApi<ImagenDto>({ method: "PUT", url: `/panel/catalogo/imagenes/${id}`, data: datos }))

export const eliminarImagenAction = (id: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/panel/catalogo/imagenes/${id}` }))
