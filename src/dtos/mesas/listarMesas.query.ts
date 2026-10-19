import type { EstadoMesa } from "./estadoMesa"

export type ListarMesasQuery = {
  estado?: EstadoMesa
  area?: string
}
