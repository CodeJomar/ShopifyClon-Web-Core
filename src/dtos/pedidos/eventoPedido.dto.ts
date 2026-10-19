import type { FechaIso } from "../core/fechaIso"

export const ACCIONES_EVENTO_PEDIDO = ["creado", "cobrado", "devuelto", "anulado", "revertido", "reimpreso"] as const

export type AccionEventoPedido = (typeof ACCIONES_EVENTO_PEDIDO)[number]

/** Fila de `GET /orders/:id/historial` (bitácora del pedido, de la más antigua a la más reciente). */
export type EventoPedidoDto = {
  accion: AccionEventoPedido
  fecha: FechaIso | null
  /** Nombre de quien realizó la acción. */
  usuario: string | null
  /** Método y monto del cobro o devolución, motivo de la anulación o cambio de estado. */
  detalle: string | null
}
