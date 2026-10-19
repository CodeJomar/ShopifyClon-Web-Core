export const METODOS_PAGO = ["efectivo", "tarjeta", "yape", "plin", "transferencia"] as const

export type MetodoPago = (typeof METODOS_PAGO)[number]
