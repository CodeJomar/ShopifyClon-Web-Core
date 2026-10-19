import type {
  ComandaEstadoEventoDto,
  ItemActualizadoEventoDto,
  TarjetaKdsDto,
} from "@/dtos/kds"
import { esEstadoDeCola } from "./schema"

/**
 * Funciones puras que aplican un evento (de la API o del tiempo real) sobre la lista de tarjetas. Son idempotentes:
 * recibir dos veces el mismo evento (la respuesta propia y el aviso del socket) deja el mismo resultado.
 */

/** Más antiguas primero (KDS-002). */
export const ordenarTablero = (tarjetas: TarjetaKdsDto[]): TarjetaKdsDto[] =>
  [...tarjetas].sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime())

/** Pedido nuevo o reabierto desde Pedidos: se agrega o se reemplaza la tarjeta completa. */
export function aplicarNuevaComanda(tarjetas: TarjetaKdsDto[], nueva: TarjetaKdsDto): TarjetaKdsDto[] {
  if (!esEstadoDeCola(nueva.estado)) return tarjetas.filter((t) => t.id_pedido !== nueva.id_pedido)
  return ordenarTablero([...tarjetas.filter((t) => t.id_pedido !== nueva.id_pedido), nueva])
}

/** El pedido cambió de estado: si ya no está en la cola (listo, pagado, anulado) sale del tablero. */
export function aplicarComandaEstado(tarjetas: TarjetaKdsDto[], evento: ComandaEstadoEventoDto): TarjetaKdsDto[] {
  if (!esEstadoDeCola(evento.estado)) return tarjetas.filter((t) => t.id_pedido !== evento.id_pedido)
  return tarjetas.map((t) => (t.id_pedido === evento.id_pedido ? { ...t, estado: evento.estado } : t))
}

/** Un producto cambió de estado; si con eso el pedido pasó a "listo", la tarjeta sale de la cola. */
export function aplicarItemActualizado(tarjetas: TarjetaKdsDto[], evento: ItemActualizadoEventoDto): TarjetaKdsDto[] {
  if (!esEstadoDeCola(evento.estado_pedido)) return tarjetas.filter((t) => t.id_pedido !== evento.id_pedido)
  return tarjetas.map((t) =>
    t.id_pedido !== evento.id_pedido
      ? t
      : {
          ...t,
          estado: evento.estado_pedido,
          items: t.items.map((i) =>
            i.id_pedido_detalle === evento.id_pedido_detalle
              ? { ...i, estado_kds: evento.estado_kds, completado: evento.completado }
              : i,
          ),
        },
  )
}
