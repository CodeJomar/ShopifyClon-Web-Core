export const TIPOS_PEDIDO = ["salon", "llevar", "delivery"] as const

export type TipoPedido = (typeof TIPOS_PEDIDO)[number]
