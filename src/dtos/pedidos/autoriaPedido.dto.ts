/** Quién tomó el pedido; acompaña al pedido en el detalle y el listado. */
export type AutoriaPedidoDto = {
  /** Nombre del usuario que registró el pedido (null si ya no existe). */
  creado_por: string | null
}
