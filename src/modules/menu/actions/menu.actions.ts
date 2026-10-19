import { apiRequest } from "@/lib/api/client"
import { CheckStatus } from "@/dtos/core/checkStatus.dto"
import { OneQuery } from "@/dtos/core/oneQuery.dto"
import type {
  ActualizarCategoriaPayload,
  ActualizarGrupoPayload,
  ActualizarOpcionPayload,
  ActualizarProductoPayload,
  AsignarGruposPayload,
  CategoriaCatalogoDto,
  CategoriaDto,
  CrearCategoriaPayload,
  CrearGrupoPayload,
  CrearOpcionPayload,
  CrearProductoPayload,
  DisponibilidadPayload,
  GrupoModificadorDto,
  ProductoDto,
  ReordenarPayload,
} from "@/dtos/menu"

// Llamadas finas a la API NestJS (/menu). Nombres únicos, precios y baja lógica los valida el backend.

/** Catálogo completo (incluye productos agotados): categorías con productos y los grupos de cada uno. */
export const getCatalogoMenu = () =>
  apiRequest<CheckStatus<CategoriaCatalogoDto[]>>(CheckStatus, { method: "GET", url: "/menu/catalogo-pos" })

/** Todos los grupos de personalización con sus opciones (para asignarlos a productos y administrarlos). */
export const getGrupos = () =>
  apiRequest<CheckStatus<GrupoModificadorDto[]>>(CheckStatus, { method: "GET", url: "/menu/grupos-modificadores" })

/* ------------------------------- Categorías -------------------------------- */

export const crearCategoria = (payload: CrearCategoriaPayload) =>
  apiRequest<OneQuery<CategoriaDto>>(OneQuery, { method: "POST", url: "/menu/categorias", data: payload })

export const actualizarCategoria = (id: string, payload: ActualizarCategoriaPayload) =>
  apiRequest<OneQuery<CategoriaDto>>(OneQuery, { method: "PATCH", url: `/menu/categorias/${id}`, data: payload })

export const eliminarCategoria = (id: string) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "DELETE", url: `/menu/categorias/${id}` })

/** Guarda el orden de las categorías (el primer id se muestra primero). */
export const reordenarCategorias = (payload: ReordenarPayload) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "PATCH", url: "/menu/categorias-orden", data: payload })

/* -------------------------------- Productos -------------------------------- */

export const crearProducto = (payload: CrearProductoPayload) =>
  apiRequest<OneQuery<ProductoDto>>(OneQuery, { method: "POST", url: "/menu/productos", data: payload })

export const actualizarProducto = (id: string, payload: ActualizarProductoPayload) =>
  apiRequest<OneQuery<ProductoDto>>(OneQuery, { method: "PATCH", url: `/menu/productos/${id}`, data: payload })

export const eliminarProducto = (id: string) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "DELETE", url: `/menu/productos/${id}` })

/** Disponible ↔ Agotado con un toque. Requiere MENU:DISPONIBILIDAD. */
export const cambiarDisponibilidadProducto = (id: string, disponible: boolean) =>
  apiRequest<OneQuery<ProductoDto>>(OneQuery, {
    method: "PATCH",
    url: `/menu/productos/${id}/toggle-disponibilidad`,
    data: { disponible } satisfies DisponibilidadPayload,
  })

/** Reemplaza TODOS los grupos de personalización del producto (lista vacía = ninguno). */
export const asignarGrupos = (idProducto: string, payload: AsignarGruposPayload) =>
  apiRequest<CheckStatus<GrupoModificadorDto[]>>(CheckStatus, {
    method: "PUT",
    url: `/menu/productos/${idProducto}/grupos-modificadores`,
    data: payload,
  })

/* ------------------------- Grupos de personalización ----------------------- */

export const crearGrupo = (payload: CrearGrupoPayload) =>
  apiRequest<OneQuery<GrupoModificadorDto>>(OneQuery, { method: "POST", url: "/menu/grupos-modificadores", data: payload })

export const actualizarGrupo = (id: string, payload: ActualizarGrupoPayload) =>
  apiRequest<OneQuery<GrupoModificadorDto>>(OneQuery, {
    method: "PATCH",
    url: `/menu/grupos-modificadores/${id}`,
    data: payload,
  })

export const eliminarGrupo = (id: string) =>
  apiRequest<CheckStatus>(CheckStatus, { method: "DELETE", url: `/menu/grupos-modificadores/${id}` })

/* --------------------------------- Opciones -------------------------------- */
// Todas devuelven el grupo ya actualizado con sus opciones.

export const crearOpcion = (idGrupo: string, payload: CrearOpcionPayload) =>
  apiRequest<OneQuery<GrupoModificadorDto>>(OneQuery, {
    method: "POST",
    url: `/menu/grupos-modificadores/${idGrupo}/opciones`,
    data: payload,
  })

export const actualizarOpcion = (idOpcion: string, payload: ActualizarOpcionPayload) =>
  apiRequest<OneQuery<GrupoModificadorDto>>(OneQuery, {
    method: "PATCH",
    url: `/menu/opciones-modificador/${idOpcion}`,
    data: payload,
  })

export const cambiarDisponibilidadOpcion = (idOpcion: string, disponible: boolean) =>
  apiRequest<OneQuery<GrupoModificadorDto>>(OneQuery, {
    method: "PATCH",
    url: `/menu/opciones-modificador/${idOpcion}/toggle-disponibilidad`,
    data: { disponible } satisfies DisponibilidadPayload,
  })

export const eliminarOpcion = (idOpcion: string) =>
  apiRequest<OneQuery<GrupoModificadorDto>>(OneQuery, { method: "DELETE", url: `/menu/opciones-modificador/${idOpcion}` })
