// Textos en español y tono de insignia de los estados de la orden (diseno-web.md §4.3).
import type { EstadoEnvio, EstadoOrden, EstadoPago, EstadoPreparacion } from "@/dtos/ordenes"

type Tono = "neutro" | "contorno" | "info" | "exito" | "marca" | "aviso" | "peligro" | "naranja"

export const ETIQUETA_ESTADO: Record<EstadoOrden, { texto: string; tono: Tono }> = {
  ABIERTA: { texto: "Abierta", tono: "neutro" },
  CERRADA: { texto: "Completada", tono: "exito" },
  CANCELADA: { texto: "Cancelada", tono: "naranja" },
}

export const ETIQUETA_PAGO: Record<EstadoPago, { texto: string; tono: Tono }> = {
  PENDIENTE: { texto: "Pago pendiente", tono: "aviso" },
  PAGADO: { texto: "Pagada", tono: "info" },
  PARCIALMENTE_REEMBOLSADO: { texto: "Reembolso parcial", tono: "naranja" },
  REEMBOLSADO: { texto: "Reembolsada", tono: "contorno" },
  ANULADO: { texto: "Anulada", tono: "peligro" },
}

export const ETIQUETA_PREPARACION: Record<EstadoPreparacion, { texto: string; tono: Tono }> = {
  NO_PREPARADO: { texto: "Sin preparar", tono: "neutro" },
  PREPARADO: { texto: "Preparada", tono: "info" },
  ENTREGADO: { texto: "Entregada", tono: "exito" },
}

export const ETIQUETA_ENVIO: Record<EstadoEnvio, string> = {
  CREADO: "Creado",
  EN_TRANSITO: "En tránsito",
  ENTREGADO: "Entregado",
  DEVUELTO: "Devuelto",
}
