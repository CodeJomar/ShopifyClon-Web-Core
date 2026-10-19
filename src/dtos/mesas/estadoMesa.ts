export const ESTADOS_MESA = ["libre", "ocupada", "por_cobrar", "por_limpiar"] as const

export type EstadoMesa = (typeof ESTADOS_MESA)[number]
