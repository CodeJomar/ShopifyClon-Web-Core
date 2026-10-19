/** Estado financiero de un pedido (distinto de su estado de preparación). */
export const ESTADOS_PAGO = ["pendiente", "parcial", "pagado", "devuelto_parcial", "devuelto"] as const

export type EstadoPago = (typeof ESTADOS_PAGO)[number]
