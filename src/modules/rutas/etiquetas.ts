// Textos en español y tono de insignia de rutas y envíos (diseno-web.md §4.3).
import type { EstadoEventoEnvio, EstadoRuta } from "@/dtos/ruta"

export type Tono = "neutro" | "contorno" | "info" | "exito" | "marca" | "aviso" | "peligro" | "naranja"

export const ETIQUETA_RUTA: Record<EstadoRuta, { texto: string; tono: Tono }> = {
  BORRADOR: { texto: "Borrador", tono: "neutro" },
  EN_CURSO: { texto: "En curso", tono: "info" },
  FINALIZADA: { texto: "Finalizada", tono: "exito" },
}

export const ETIQUETA_EVENTO: Record<EstadoEventoEnvio, { texto: string; tono: Tono }> = {
  CREADO: { texto: "Envío creado", tono: "neutro" },
  EN_TRANSITO: { texto: "En camino", tono: "info" },
  ENTREGADO: { texto: "Entregado", tono: "exito" },
  NO_ENTREGADO: { texto: "No se pudo entregar", tono: "aviso" },
  DEVUELTO: { texto: "Devuelto", tono: "naranja" },
}

/** "2026-11-03" → "03/11/2026" sin pasar por zonas horarias (la fecha de la ruta es un día, no un instante). */
export function formatearDia(dia: string): string {
  const [anio, mes, d] = dia.split("-")
  return anio && mes && d ? `${d}/${mes}/${anio}` : dia
}
