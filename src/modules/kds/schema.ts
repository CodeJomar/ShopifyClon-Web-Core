import type { ItemKdsDto, TarjetaKdsDto } from "@/dtos/kds"
import type { EstadoItemKds, EstadoPedido, TipoPedido } from "@/dtos/pedidos"

/* -------------------------------------------------------------------------- */
/*                 Estados de la cola (lo que muestra el KDS)                  */
/* -------------------------------------------------------------------------- */

/**
 * La cola del KDS solo tiene pedidos "pendiente" y "en_preparacion". Cuando todos los productos de un pedido están
 * despachados, la API lo pasa a "listo" y sale de la cola (sigue existiendo en Pedidos, donde se puede reabrir).
 */
export type EstadoColaKds = Extract<EstadoPedido, "pendiente" | "en_preparacion">

export const ESTADOS_COLA_KDS: readonly EstadoColaKds[] = ["pendiente", "en_preparacion"]

export const esEstadoDeCola = (estado: EstadoPedido): estado is EstadoColaKds =>
  (ESTADOS_COLA_KDS as readonly EstadoPedido[]).includes(estado)

export const ESTADO_COMANDA_LABELS: Record<EstadoColaKds, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
}

export type FiltroEstadoKds = EstadoColaKds | "todas"

export const FILTRO_ESTADO_LABELS: Record<FiltroEstadoKds, string> = {
  todas: "Todas",
  pendiente: "Pendientes",
  en_preparacion: "En preparación",
}

export const ESTADO_ITEM_LABELS: Record<EstadoItemKds, string> = {
  cola: "En cola",
  preparando: "Preparando",
  despachado: "Listo",
}

export const TIPO_PEDIDO_LABELS: Record<TipoPedido, string> = {
  salon: "Salón",
  llevar: "Llevar",
  delivery: "Delivery",
}

/** Cada cuánto se vuelve a pedir el tablero completo (respaldo del tiempo real y del socket caído). */
export const SONDEO_TABLERO_MS = 20_000

/** Comandas por página en la cuadrícula. */
export const COMANDAS_POR_PAGINA = 8

/* -------------------------------------------------------------------------- */
/*                         Datos derivados de una comanda                      */
/* -------------------------------------------------------------------------- */

/** La API no tiene un correlativo de comanda: se usa el inicio del identificador del pedido (como en el comprobante). */
export const codigoComanda = (tarjeta: Pick<TarjetaKdsDto, "id_pedido" | "correlativo">): string =>
  tarjeta.correlativo ? `#${tarjeta.correlativo}` : tarjeta.id_pedido.slice(0, 8).toUpperCase()

/** "Mesa 4", "Para llevar" o "Delivery". */
export function destinoComanda(tarjeta: Pick<TarjetaKdsDto, "tipo_pedido" | "mesa_numero">): string {
  if (tarjeta.tipo_pedido === "salon") return tarjeta.mesa_numero ? `Mesa ${tarjeta.mesa_numero}` : "Salón"
  return tarjeta.tipo_pedido === "llevar" ? "Para llevar" : "Delivery"
}

/** Minutos enteros desde que se creó el pedido (se recalcula en el navegador para que no quede desfasado). */
export function minutosDesde(fechaIso: string, ahora: number): number {
  return Math.max(0, Math.floor((ahora - new Date(fechaIso).getTime()) / 60_000))
}

export const textoMinutos = (minutos: number): string => `${minutos} min`

/** "Leche de avena · Caliente": solo las opciones elegidas, en una línea. */
export const textoModificadores = (item: Pick<ItemKdsDto, "modificadores">): string =>
  item.modificadores.map((m) => m.opcion).join(" · ")

/** Unidades totales del pedido. */
export const totalUnidades = (tarjeta: Pick<TarjetaKdsDto, "items">): number =>
  tarjeta.items.reduce((suma, item) => suma + item.cantidad, 0)
