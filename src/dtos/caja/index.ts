/**
 * Caja y transacciones (API `/transactions`). Caja única: un solo turno abierto para todo el local.
 * Todos los importes son `Dinero` (texto con 2 decimales).
 */

export * from "./ajusteCaja.payload"
export * from "./aperturaTurno.payload"
export * from "./cierreTurno.payload"
export * from "./cobroPedido.payload"
export * from "./cobroResultado.dto"
export * from "./devolucion.payload"
export * from "./devolucionResultado.dto"
export * from "./estadoPago"
export * from "./estadoTurno"
export * from "./historial.query"
export * from "./lineaPago.payload"
export * from "./metodoPago"
export * from "./movimientoCaja.payload"
export * from "./movimientoHistorial.dto"
export * from "./tipoMovimiento"
export * from "./transaccionCaja.dto"
export * from "./turnoActual.dto"
export * from "./turnoCaja.dto"
export * from "./denominacion"
export * from "./listarTurnos.query"
export * from "./turnoListado.dto"
