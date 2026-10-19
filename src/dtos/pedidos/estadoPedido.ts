export const ESTADOS_PEDIDO = ["pendiente", "en_preparacion", "listo", "pagado", "anulado"] as const

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number]

/** Estados que se pueden pedir con PATCH /orders/:id/estado ("pagado" solo lo fija el cobro). */
export type EstadoPedidoEditable = Exclude<EstadoPedido, "pagado">
