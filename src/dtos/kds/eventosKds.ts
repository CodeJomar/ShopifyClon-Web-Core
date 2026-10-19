/**
 * El socket se abre con un ticket de 30 s: `POST /auth/ws-ticket` y luego `io(url + "/kds", { auth: { ticket } })`.
 * La API revalida sesión y permisos en cada evento que se envía.
 */
export const EVENTOS_KDS = {
  /** servidor → clientes: tarjeta completa (pedido nuevo o reabierto desde Pedidos). */
  nuevaComanda: "kds:nueva-comanda",
  /** servidor → clientes: el pedido cambió de estado (o se pagó y sale de la cola). */
  comandaEstado: "kds:comanda-estado",
  /** servidor → clientes: un producto cambió de estado. */
  itemActualizado: "kds:item-actualizado",
  /** servidor → clientes: una mesa cambió de estado. */
  mesaEstado: "mesa:estado-actualizado",
  /** servidor → clientes: cambió el estado de pago de un pedido. */
  pagoActualizado: "pedido:pago-actualizado",
  /** servidor → clientes: el menú cambió (productos, categorías o modificadores); conviene volver a leerlo. */
  catalogoActualizado: "menu:catalogo-actualizado",
  /** cliente → servidor (requiere KDS:DESPACHAR). */
  cambiarEstadoItem: "kds:cambiar-estado-item",
  /** cliente → servidor (requiere TABLES:CAMBIAR_ESTADO): la mesa por limpiar pasa a libre. */
  cambiarEstadoLimpieza: "kds:cambiar-estado-limpieza",
} as const
