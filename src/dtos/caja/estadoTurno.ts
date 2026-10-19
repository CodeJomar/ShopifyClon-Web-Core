export const ESTADOS_TURNO = ["abierta", "cerrada", "descuadre"] as const

export type EstadoTurno = (typeof ESTADOS_TURNO)[number]
