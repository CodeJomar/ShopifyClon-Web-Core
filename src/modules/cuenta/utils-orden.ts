import type { TonoInsignia } from "@/shared/components/ui/badge"

// Etiquetas y tonos de los estados de la orden (docs/diseno-web.md §4.3). Lo que ve la persona: nunca el código de la API.

export const ETIQUETA_PAGO: Record<string, { texto: string; tono: TonoInsignia }> = {
  PENDIENTE: { texto: "Pago pendiente", tono: "aviso" },
  PAGADO: { texto: "Pagada", tono: "info" },
  PARCIALMENTE_REEMBOLSADO: { texto: "Reembolso parcial", tono: "naranja" },
  REEMBOLSADO: { texto: "Reembolsada", tono: "contorno" },
  ANULADO: { texto: "Anulada", tono: "peligro" },
}

export const ETIQUETA_PREPARACION: Record<string, { texto: string; tono: TonoInsignia }> = {
  NO_PREPARADO: { texto: "Por preparar", tono: "neutro" },
  PREPARADO: { texto: "Preparada", tono: "indigo" },
  ENTREGADO: { texto: "Entregada", tono: "exito" },
}

/** Respaldo para un estado que la web no conoce: se muestra tal cual, con tono neutro. */
export const etiquetaDe = (mapa: Record<string, { texto: string; tono: TonoInsignia }>, codigo: string) =>
  mapa[codigo] ?? { texto: codigo.replace(/_/g, " ").toLowerCase(), tono: "neutro" as TonoInsignia }
