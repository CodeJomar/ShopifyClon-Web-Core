import type { Dinero } from "../core/dinero"
import type { EntidadAuditada } from "../core/entidadAuditada"
import type { UUID } from "../core/helpers"
import type { MetodoPago } from "./metodoPago"
import type { TipoMovimiento } from "./tipoMovimiento"

/** Fila del libro de caja (venta, ingreso, retiro, devolución o ajuste). El libro es de solo inserción. */
export type TransaccionCajaDto = EntidadAuditada & {
  id_transaccion_caja: UUID
  id_turno_caja: UUID
  id_pedido: UUID | null
  tipo_movimiento: TipoMovimiento
  metodo_pago: MetodoPago
  monto: Dinero
  /** Motivo (obligatorio en movimientos manuales, devoluciones y ajustes) o nota del cobro. */
  notas: string | null
  es_ajuste: boolean
  /** En una devolución: el cobro (venta) que revierte. */
  id_transaccion_origen: UUID | null
}
