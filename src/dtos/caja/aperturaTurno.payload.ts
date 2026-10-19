import type { Dinero } from "../core/dinero"

export type AperturaTurnoPayload = {
  monto_inicial: Dinero
  /** Nota opcional de la apertura (máx. 255 caracteres), por ejemplo quién entregó el fondo. */
  nota_apertura?: string
}
