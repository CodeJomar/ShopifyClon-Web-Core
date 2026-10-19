"use client"

import type { MetodoPago } from "@/dtos/caja"

/* -------------------------------------------------------------------------- */
/*                               Modal de Cobro                               */
/* -------------------------------------------------------------------------- */

/** Pedido que se puede cobrar (los importes son `Dinero`). */
export interface PedidoACobrar {
  id_pedido: string
  /** Texto para identificarlo: "A1B2C3D4 · Mesa 3". */
  etiqueta: string
  total: string
  saldo_pendiente: string
}

export interface LineaPago {
  id: string
  metodo: MetodoPago
  /** Lo que se aplica al pedido (texto del campo). */
  monto: string
  /** Solo efectivo: lo que entrega el cliente, para calcular el vuelto (no se envía a la API). */
  recibido: string
}

export const nuevaLinea = (monto: string, metodo: MetodoPago = "efectivo"): LineaPago => ({
  id: crypto.randomUUID(),
  metodo,
  monto,
  recibido: "",
})
