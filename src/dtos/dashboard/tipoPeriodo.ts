export const TIPOS_PERIODO = ["dia", "rango", "turno"] as const

export type TipoPeriodo = (typeof TIPOS_PERIODO)[number]
