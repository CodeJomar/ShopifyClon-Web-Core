// Contrato de rutas de reparto y seguimiento del envío (A-004, snake_case). La web no calcula ni decide estados.

export type EstadoRuta = "BORRADOR" | "EN_CURSO" | "FINALIZADA"
export type EstadoEventoEnvio = "CREADO" | "EN_TRANSITO" | "ENTREGADO" | "NO_ENTREGADO" | "DEVUELTO"

/** Elemento de GET /panel/rutas. */
export interface RutaLista {
  id: string
  codigo: string
  fecha: string
  chofer: string
  placa: string
  estado: EstadoRuta
  total_paradas: number
  paradas_entregadas: number
}

export interface DireccionParada {
  direccion_linea1: string
  direccion_linea2?: string | null
  ciudad: string
  estado_provincia: string
  codigo_postal: string
  pais: string
}

export interface ItemParada {
  titulo_producto: string
  titulo_variante: string
  sku?: string | null
  cantidad: number
}

export interface ParadaRuta {
  posicion: number
  envio_id: string
  orden_id: string
  numero_orden: string
  numero_guia?: string | null
  estado_envio: "CREADO" | "EN_TRANSITO" | "ENTREGADO" | "DEVUELTO"
  destinatario: string
  telefono?: string | null
  direccion: DireccionParada
  latitud?: number | null
  longitud?: number | null
  items: ItemParada[]
}

export interface TiendaRemitente {
  nombre: string
  correo_electronico?: string | null
  telefono?: string | null
  direccion?: string | null
}

/** GET /panel/rutas/{id}: lo necesario para el detalle y para la guía de remisión. */
export interface RutaDetalle {
  id: string
  codigo: string
  fecha: string
  chofer: string
  placa: string
  estado: EstadoRuta
  nota?: string | null
  tienda: TiendaRemitente
  paradas: ParadaRuta[]
}

/** Elemento de GET /panel/envios/disponibles-para-ruta. */
export interface EnvioDisponible {
  envio_id: string
  numero_orden: string
  numero_guia?: string | null
  estado_envio: "CREADO" | "EN_TRANSITO"
  destinatario: string
  ciudad: string
  direccion_linea1: string
  total_items: number
}

/** Cuerpo de POST y PUT /panel/rutas. El orden de `envio_ids` es el orden de las paradas. */
export interface RutaRequest {
  fecha: string
  chofer: string
  placa: string
  nota?: string
  envio_ids: string[]
}

/** Elemento de GET /panel/envios/{id}/eventos (más reciente primero). */
export interface EventoEnvio {
  id: string
  estado: EstadoEventoEnvio
  nota?: string | null
  foto_url?: string | null
  fecha_evento: string
}

/** Cuerpo opcional de POST /panel/envios/{id}/entregar. */
export interface EntregaRequest {
  foto_url?: string
  nota?: string
}

/** GET /seguimiento/{numero_guia}: público, sin datos personales. */
export interface SeguimientoPublico {
  numero_guia: string
  estado: EstadoEventoEnvio
  fecha_despacho?: string | null
  fecha_entrega_estimada?: string | null
  fecha_entrega_real?: string | null
  eventos: EventoEnvio[]
}
