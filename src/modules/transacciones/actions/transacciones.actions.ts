import { apiRequest } from "@/lib/api/client"
import { CheckStatus } from "@/dtos/core/checkStatus.dto"
import { DataQuery } from "@/dtos/core/dataQuery.dto"
import { OneQuery } from "@/dtos/core/oneQuery.dto"
import type {
  AperturaTurnoPayload,
  CierreTurnoPayload,
  DevolucionPayload,
  DevolucionResultadoDto,
  MovimientoCajaPayload,
  MovimientoHistorialDto,
  TransaccionCajaDto,
  TurnoActualDto,
  TurnoCajaDto,
  TurnoListadoDto,
} from "@/dtos/caja"
import type {
  CambiarEstadoPedidoPayload,
  ComprobanteDto,
  EventoPedidoDto,
  ListarPedidosQuery,
  PedidoDto,
  PedidoListadoDto,
  ReimpresionComprobanteDto,
} from "@/dtos/pedidos"

// Llamadas finas a la API NestJS: caja única (un solo turno abierto), libro de caja de solo inserción y pedidos.

/** Turno abierto con su resumen. Si la caja está cerrada la API responde 404 (no es un error de la pantalla). */
export const getTurnoActual = () =>
  apiRequest<CheckStatus<TurnoActualDto>>(CheckStatus, { method: "GET", url: "/transactions/turnos/actual" })

/** Movimientos del libro de caja: los del turno indicado o, sin filtro, todos los que el usuario puede ver. */
export const getHistorialCaja = (idTurno?: string) =>
  apiRequest<CheckStatus<MovimientoHistorialDto[]>>(CheckStatus, {
    method: "GET",
    url: "/transactions/historial",
    params: idTurno ? { id_turno: idTurno } : undefined,
  })

/** Turnos de caja con cajero, diferencia, conteo y lo vendido (más recientes primero). */
export const getTurnos = (pagina = 1, limite = 20) =>
  apiRequest<DataQuery<TurnoListadoDto>>(DataQuery, { method: "GET", url: "/transactions/turnos", params: { pagina, limite } })

export const abrirTurno = (payload: AperturaTurnoPayload) =>
  apiRequest<OneQuery<TurnoCajaDto>>(OneQuery, { method: "POST", url: "/transactions/turnos/apertura", data: payload })

export const cerrarTurno = (idTurno: string, payload: CierreTurnoPayload) =>
  apiRequest<OneQuery<TurnoCajaDto>>(OneQuery, {
    method: "POST",
    url: `/transactions/turnos/${idTurno}/cierre`,
    data: payload,
  })

export const registrarMovimiento = (payload: MovimientoCajaPayload) =>
  apiRequest<OneQuery<TransaccionCajaDto>>(OneQuery, { method: "POST", url: "/transactions/movimientos", data: payload })

/** Pedidos del rango de fechas (sin fechas, los de hoy), del más reciente al más antiguo. */
export const getPedidos = (query: ListarPedidosQuery) =>
  apiRequest<DataQuery<PedidoListadoDto>>(DataQuery, { method: "GET", url: "/orders", params: query })

/** Comprobante interno: productos, desglose de IGV, pagos y devoluciones del pedido. */
export const getComprobante = (idPedido: string) =>
  apiRequest<OneQuery<ComprobanteDto>>(OneQuery, { method: "GET", url: `/orders/${idPedido}/comprobante` })

/** Devolución total o parcial de un cobro. `clave` evita devolver dos veces ante un doble toque o un reintento. */
export const devolverCobro = (payload: DevolucionPayload, clave: string) =>
  apiRequest<OneQuery<DevolucionResultadoDto>>(OneQuery, {
    method: "POST",
    url: "/transactions/devoluciones",
    data: payload,
    headers: { "Idempotency-Key": clave },
  })

/** Anula un pedido (exige motivo y el permiso ORDERS:ANULAR). */
export const anularPedido = (idPedido: string, motivo: string) =>
  apiRequest<OneQuery<PedidoDto>>(OneQuery, {
    method: "PATCH",
    url: `/orders/${idPedido}/estado`,
    data: { estado: "anulado", motivo } satisfies CambiarEstadoPedidoPayload,
  })

/** Bitácora del pedido: creación, cobros, devoluciones, anulación, reversiones y reimpresiones. */
export const getBitacoraPedido = (idPedido: string) =>
  apiRequest<CheckStatus<EventoPedidoDto[]>>(CheckStatus, { method: "GET", url: `/orders/${idPedido}/historial` })

/** Reimprime el comprobante: queda registrado quién lo pidió y se devuelve marcado como copia. */
export const reimprimirComprobante = (idPedido: string) =>
  apiRequest<OneQuery<ReimpresionComprobanteDto>>(OneQuery, { method: "POST", url: `/orders/${idPedido}/comprobante/reimprimir` })
