import type { Dinero } from "../core/dinero"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoItemKds } from "./estadoItemKds"
import type { ModificadorPedidoDto } from "./modificadorPedido.dto"

/** Producto de un pedido. Nombre y precios son una foto: no cambian si después se edita el menú. */
export type ItemPedidoDto = {
  id_pedido_detalle: UUID
  id_pedido: UUID
  id_producto: UUID
  nombre_producto: string
  cantidad: number
  /** Precio unitario BASE; las variaciones están en `modificadores`. */
  precio_unitario: Dinero
  /** (precio base + variaciones) × cantidad. */
  subtotal: Dinero
  notas_preparacion: string | null
  modificadores: ModificadorPedidoDto[] | null
  estado_kds: EstadoItemKds
  despachado_el: FechaIso | null
  fecha_creacion: FechaIso
  fecha_edicion: FechaIso
}
