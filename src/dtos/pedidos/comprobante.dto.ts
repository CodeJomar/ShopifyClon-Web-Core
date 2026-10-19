import type { EstadoPago } from "../caja/estadoPago"
import type { MetodoPago } from "../caja/metodoPago"
import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "./estadoPedido"
import type { ModificadorPedidoDto } from "./modificadorPedido.dto"
import type { TipoPedido } from "./tipoPedido"

/** `GET /orders/:id/comprobante`: comprobante INTERNO (no sustituye la boleta o factura electrónica). */
export type ComprobanteDto = {
  /** Número corto para mostrar (8 caracteres). */
  numero: string
  /** Número legible del pedido (#1, #2…). */
  correlativo: number
  cliente_nombre: string | null
  /** Nombre de quien tomó el pedido. */
  atendido_por: string | null
  /** Cuántas veces se reimprimió el comprobante. */
  reimpresiones: number
  aviso: string
  fecha: FechaIso
  mesa_numero: string | null
  tipo_pedido: TipoPedido
  estado: EstadoPedido
  estado_pago: EstadoPago
  items: Array<{
    producto: string
    cantidad: number
    precio_unitario: Dinero
    modificadores: ModificadorPedidoDto[]
    notas_preparacion: string | null
    subtotal: Dinero
  }>
  subtotal: Dinero
  descuento: Dinero
  total: Dinero
  desglose: {
    base_imponible: Dinero
    igv_18: Dinero
  }
  pagos: Array<{
    id_transaccion: UUID
    metodo_pago: MetodoPago
    monto: Dinero
    fecha: FechaIso
    /** Nombre de quien lo registró. */
    registrado_por: string
  }>
  devoluciones: Array<{
    id_transaccion: UUID
    id_transaccion_origen: UUID
    metodo_pago: MetodoPago
    monto: Dinero
    motivo: string
    fecha: FechaIso
    registrado_por: string
  }>
  total_pagado: Dinero
  total_devuelto: Dinero
  neto_cobrado: Dinero
  saldo_pendiente: Dinero
}
