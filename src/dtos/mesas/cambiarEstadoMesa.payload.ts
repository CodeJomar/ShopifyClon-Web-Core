import type { EstadoMesa } from "./estadoMesa"

/** Cambio manual de estado. Las transiciones válidas las controla la API (409 si no es posible). */
export type CambiarEstadoMesaPayload = {
  estado: EstadoMesa
}
