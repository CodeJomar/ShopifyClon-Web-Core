import type { Dinero } from "../core/dinero"
import type { FechaHoraLocal } from "../core/fechaHoraLocal"

export type CajaActualDto =
  | { abierta: false }
  | {
      abierta: true
      abierta_por: string
      desde: FechaHoraLocal
      monto_inicial: Dinero
      efectivo_esperado: Dinero
      /** Lo vendido en el turno que entra a la gaveta (efectivo). */
      ventas_efectivo: Dinero
      /** Lo vendido en el turno con tarjeta, Yape, Plin o transferencia. */
      ventas_digitales: Dinero
    }
