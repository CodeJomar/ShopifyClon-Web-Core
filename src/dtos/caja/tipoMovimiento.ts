export const TIPOS_MOVIMIENTO = ["venta", "ingreso_manual", "retiro_manual", "devolucion"] as const

export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number]

/** Movimientos que se registran a mano (los de venta y devolución nacen de cobrar y devolver). */
export type TipoMovimientoManual = Extract<TipoMovimiento, "ingreso_manual" | "retiro_manual">
