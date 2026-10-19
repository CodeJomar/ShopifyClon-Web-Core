/**
 * Cocina y barra (API `/kds` y WebSocket, namespace `kds`). El KDS nunca recibe precios ni importes: solo lo
 * necesario para preparar. Un pedido que pasa a "listo" sale de la cola (sigue existiendo en Pedidos).
 */

export * from "./acuseSocket.dto"
export * from "./cambiarEstadoItem.payload"
export * from "./cambiarEstadoItemSocket.payload"
export * from "./cambiarEstadoLimpiezaSocket.payload"
export * from "./comandaEstadoEvento.dto"
export * from "./eventosKds"
export * from "./itemActualizadoEvento.dto"
export * from "./itemEstadoCambiado.dto"
export * from "./itemKds.dto"
export * from "./tarjetaKds.dto"
export * from "./wsTicket.dto"
