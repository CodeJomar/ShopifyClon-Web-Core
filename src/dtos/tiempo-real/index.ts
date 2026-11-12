// Contrato de tiempo real (W-022): mensajes STOMP que publica la API (snake_case) y el ticket para conectarse.

export type TipoEventoOrden = "ORDEN_CREADA" | "ORDEN_PAGADA" | "ORDEN_CANCELADA" | "ENVIO_DESPACHADO" | "ENVIO_ENTREGADO"

/** `datos` de POST /auth/ws-ticket: ticket efímero de un solo uso para el CONNECT del panel. */
export interface TicketWs {
  ticket: string
  expira_en: string
  ttl_segundos: number
}

/** Mensaje de `/topic/tienda/{tiendaId}/ordenes` (solo para quien puede ver las órdenes de la tienda). */
export interface NotificacionOrdenTienda {
  tipo: TipoEventoOrden
  orden_id: string
  tienda_id: string
  numero_orden: string
  nombre_cliente?: string | null
  total?: number | null
  moneda?: string | null
  estado?: string | null
  estado_pago?: string | null
  estado_preparacion?: string | null
  motivo?: string | null
  envio_id?: string | null
  numero_guia?: string | null
  transportista?: string | null
  ocurrido_en: string
}

/** Mensaje de `/topic/ordenes/{tokenAcceso}`: solo el estado de esa orden, sin datos internos ni de terceros. */
export interface NotificacionOrdenComprador {
  tipo: TipoEventoOrden
  numero_orden: string
  estado?: string | null
  estado_pago?: string | null
  estado_preparacion?: string | null
  motivo?: string | null
  numero_guia?: string | null
  transportista?: string | null
  url_seguimiento?: string | null
  ocurrido_en: string
}
