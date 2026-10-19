import type { MetodoPago } from "@/dtos/caja"
import type { GrupoModificadorDto, ProductoPosDto } from "@/dtos/menu"
import type { MesaConPedidoDto } from "@/dtos/mesas"
import type { ItemPedidoPayload, TipoPedido } from "@/dtos/pedidos"
import { aCentimos } from "@/shared/utils/dinero"

/* -------------------------------------------------------------------------- */
/*                         Tipo de atención del pedido                         */
/* -------------------------------------------------------------------------- */

/** El POS atiende en mesa o para llevar (el tipo "delivery" existe en la API pero aún no tiene pantalla). */
export type TipoAtencion = Extract<TipoPedido, "salon" | "llevar">

export const TIPOS_ATENCION: readonly TipoAtencion[] = ["salon", "llevar"]

export const TIPO_ATENCION_LABELS: Record<TipoAtencion, string> = {
  salon: "En mesa",
  llevar: "Para llevar",
}

/* -------------------------------------------------------------------------- */
/*                                  Catálogo                                   */
/* -------------------------------------------------------------------------- */

export type ProductoPos = ProductoPosDto

/** Producto del catálogo con el nombre de su categoría (la API lo entrega anidado dentro de ella). */
export type ProductoCatalogo = ProductoPos & { categoria_nombre: string }

export interface CategoriaPos {
  id: string
  nombre: string
}

/** Identificador de categoría; "todos" es un filtro, no una categoría real. */
export type FiltroCategoria = string

export const FILTRO_TODOS = "todos" as const

/** Los precios del catálogo ya incluyen IGV: el desglose es solo informativo (el total no cambia). */
export const IGV_TASA = 0.18

/** Límite de unidades por línea en un mismo ticket. */
export const MAX_CANTIDAD_ITEM = 99

/** Máximo de caracteres de la nota de preparación que acepta la API. */
export const MAX_NOTA_PREPARACION = 255

/** Productos por página en el catálogo y mesas por página en el mapa. */

/** Cada cuánto se vuelve a pedir el catálogo y las mesas (respaldo del tiempo real). */
export const SONDEO_POS_MS = 30_000

/* -------------------------------------------------------------------------- */
/*                                    Mesas                                    */
/* -------------------------------------------------------------------------- */

export type MesaPos = MesaConPedidoDto

export const FILTRO_TODAS_LAS_AREAS = "todas"
export const AREA_SIN_ASIGNAR = "Sin área"

/** Nombre del área de una mesa (las áreas son texto libre que administra el propietario). */
export const areaDeMesa = (mesa: Pick<MesaPos, "area">): string => mesa.area?.trim() || AREA_SIN_ASIGNAR

/** Áreas distintas, en el orden en que aparecen las mesas. */
export function areasDeMesas(mesas: readonly MesaPos[]): string[] {
  return [...new Set(mesas.map(areaDeMesa))]
}

/* -------------------------------------------------------------------------- */
/*                                  Carrito                                    */
/* -------------------------------------------------------------------------- */

/** Opción de modificador elegida, con lo necesario para mostrarla y calcular el precio. */
export interface SeleccionModificador {
  id_grupo: string
  grupo: string
  id_opcion: string
  opcion: string
  /** Variación de precio con signo ("0.00", "1.50"). */
  price_delta: string
}

export interface ItemCarrito {
  /** Identificador de la línea en el carrito (no es el del producto: un mismo producto puede tener varias líneas). */
  uid: string
  producto: ProductoPos
  cantidad: number
  modificadores: SeleccionModificador[]
  notas?: string
}

/** Todos los importes en céntimos enteros. */
export interface TotalesCarrito {
  unidades: number
  subtotal: number
  igv: number
  total: number
}

export const tieneConfiguracion = (item: Pick<ItemCarrito, "modificadores" | "notas">): boolean =>
  item.modificadores.length > 0 || Boolean(item.notas?.trim())

/** Precio de una unidad: base más la variación de cada opción elegida (en céntimos). */
export const precioUnitarioCentimos = (item: Pick<ItemCarrito, "producto" | "modificadores">): number =>
  aCentimos(item.producto.precio) + item.modificadores.reduce((suma, m) => suma + aCentimos(m.price_delta), 0)

export const subtotalLineaCentimos = (item: ItemCarrito): number => precioUnitarioCentimos(item) * item.cantidad

export function calcularTotales(items: readonly ItemCarrito[]): TotalesCarrito {
  const total = items.reduce((suma, item) => suma + subtotalLineaCentimos(item), 0)
  const subtotal = Math.round(total / (1 + IGV_TASA))
  return {
    unidades: items.reduce((suma, item) => suma + item.cantidad, 0),
    subtotal,
    igv: total - subtotal,
    total,
  }
}

/** Una línea del carrito sin configuración se agrupa con otra igual del mismo producto. */
export const claveAgrupacion = (producto: ProductoPos): string => `base:${producto.id_producto}`

/** Cuerpo de las líneas del pedido: el servidor resuelve precio, nombre y disponibilidad (solo se envían ids). */
export const itemsParaPedido = (items: readonly ItemCarrito[]): ItemPedidoPayload[] =>
  items.map((item) => ({
    id_producto: item.producto.id_producto,
    cantidad: item.cantidad,
    ...(item.notas?.trim() ? { notas_preparacion: item.notas.trim() } : {}),
    ...(item.modificadores.length > 0 ? { modificadores: item.modificadores.map((m) => ({ id_opcion: m.id_opcion })) } : {}),
  }))

/* -------------------------------------------------------------------------- */
/*                         Reglas de selección de opciones                      */
/* -------------------------------------------------------------------------- */

/** El grupo exige elegir al menos una opción (la API rechaza el pedido si falta). */
export const grupoObligatorio = (grupo: GrupoModificadorDto): boolean => grupo.seleccion_minima > 0

/** El grupo admite una sola opción (se muestra como selector excluyente). */
export const grupoExcluyente = (grupo: GrupoModificadorDto): boolean => grupo.seleccion_maxima === 1

/** Mensaje de error si la selección de un grupo no cumple su mínimo o máximo; null si es válida. */
export function errorDeSeleccion(grupo: GrupoModificadorDto, elegidas: number): string | null {
  if (elegidas < grupo.seleccion_minima) {
    return grupo.seleccion_minima === 1
      ? `Elige una opción de "${grupo.nombre}".`
      : `Elige al menos ${grupo.seleccion_minima} opciones de "${grupo.nombre}".`
  }
  if (grupo.seleccion_maxima > 0 && elegidas > grupo.seleccion_maxima) {
    return `"${grupo.nombre}" admite como máximo ${grupo.seleccion_maxima}.`
  }
  return null
}

/* -------------------------------------------------------------------------- */
/*                                    Cobro                                    */
/* -------------------------------------------------------------------------- */

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
}

/** Máximo de líneas de pago por cobro (límite de la API). */
export const MAX_LINEAS_PAGO = 6
