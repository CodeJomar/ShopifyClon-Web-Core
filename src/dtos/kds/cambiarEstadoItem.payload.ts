import type { EstadoItemKds } from "../pedidos/estadoItemKds"

/** `PATCH /kds/items/:id/estado`: cambia un producto y la API mueve sola el estado del pedido. */
export type CambiarEstadoItemPayload = {
  estado_kds: EstadoItemKds
}
