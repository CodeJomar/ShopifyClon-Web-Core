export const ESTADOS_ITEM_KDS = ["cola", "preparando", "despachado"] as const

export type EstadoItemKds = (typeof ESTADOS_ITEM_KDS)[number]
