import type { UUID } from "../core/helpers"
import type { EstadoItemKds } from "../pedidos/estadoItemKds"

export type ItemKdsDto = {
  id_pedido_detalle: UUID
  nombre_producto: string
  cantidad: number
  notas_preparacion: string | null
  modificadores: Array<{ grupo: string; opcion: string }>
  estado_kds: EstadoItemKds
  /** true cuando está despachado. */
  completado: boolean
}
