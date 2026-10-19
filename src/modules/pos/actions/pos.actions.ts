import { apiRequest } from "@/lib/api/client"
import { CheckStatus } from "@/dtos/core/checkStatus.dto"
import { DataQuery } from "@/dtos/core/dataQuery.dto"
import { OneQuery } from "@/dtos/core/oneQuery.dto"
import type { CobroPedidoPayload, CobroResultadoDto } from "@/dtos/caja"
import type { CategoriaCatalogoDto } from "@/dtos/menu"
import type { MesaConPedidoDto, MesaDto } from "@/dtos/mesas"
import type { CrearPedidoPayload, PedidoCreadoDto, PedidoListadoDto } from "@/dtos/pedidos"

// Llamadas finas a la API NestJS. Precios, disponibilidad, caja abierta y topes de cobro los valida el backend.

/** Categorías con sus productos y los grupos de modificadores de cada uno, listas para el POS. */
export const getCatalogoPos = () =>
  apiRequest<CheckStatus<CategoriaCatalogoDto[]>>(CheckStatus, { method: "GET", url: "/menu/catalogo-pos" })

/** Mesas con su estado y su pedido en curso. */
export const getMesasPos = () =>
  apiRequest<CheckStatus<MesaConPedidoDto[]>>(CheckStatus, { method: "GET", url: "/tables" })

/** Pedidos de hoy de una mesa (el cobro se hace por pedido). */
export const getPedidosDeMesa = (idMesa: string) =>
  apiRequest<DataQuery<PedidoListadoDto>>(DataQuery, {
    method: "GET",
    url: "/orders",
    params: { id_mesa: idMesa, limite: 50 },
  })

/** Crea la comanda y la envía a cocina. `clave` evita duplicados ante un doble toque o un reintento. */
export const crearPedido = (payload: CrearPedidoPayload, clave: string) =>
  apiRequest<OneQuery<PedidoCreadoDto>>(OneQuery, {
    method: "POST",
    url: "/orders",
    data: payload,
    headers: { "Idempotency-Key": clave },
  })

/** Registra uno o varios pagos de un pedido (pago mixto o parcial). Requiere TRANSACTIONS:COBRAR. */
export const cobrarPedido = (payload: CobroPedidoPayload, clave: string) =>
  apiRequest<OneQuery<CobroResultadoDto>>(OneQuery, {
    method: "POST",
    url: "/transactions/cobrar",
    data: payload,
    headers: { "Idempotency-Key": clave },
  })

/** Marca una mesa como libre (la limpieza terminó). Requiere TABLES:CAMBIAR_ESTADO. */
export const liberarMesa = (idMesa: string) =>
  apiRequest<OneQuery<MesaDto>>(OneQuery, {
    method: "PATCH",
    url: `/tables/${idMesa}/estado`,
    data: { estado: "libre" },
  })
