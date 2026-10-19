import { apiRequest } from "@/lib/api/client"
import { CheckStatus } from "@/dtos/core/checkStatus.dto"
import { OneQuery } from "@/dtos/core/oneQuery.dto"
import type { CambiarEstadoItemPayload, ItemEstadoCambiadoDto, TarjetaKdsDto } from "@/dtos/kds"
import type { EstadoItemKds } from "@/dtos/pedidos"

// Llamadas finas a la API NestJS: las reglas (transiciones, auditoría de reversiones, estado del pedido) las aplica el backend.

/** Cola activa: pedidos pendientes o en preparación, con modificadores y notas, sin precios. Más antiguos primero. */
export const getTableroKds = () =>
  apiRequest<CheckStatus<TarjetaKdsDto[]>>(CheckStatus, { method: "GET", url: "/kds/tablero" })

/** Cambia el estado de un producto (requiere KDS:DESPACHAR). La API mueve sola el estado del pedido. */
export const cambiarEstadoItemKds = (idPedidoDetalle: string, estado: EstadoItemKds) =>
  apiRequest<OneQuery<ItemEstadoCambiadoDto>>(OneQuery, {
    method: "PATCH",
    url: `/kds/items/${idPedidoDetalle}/estado`,
    data: { estado_kds: estado } satisfies CambiarEstadoItemPayload,
  })
