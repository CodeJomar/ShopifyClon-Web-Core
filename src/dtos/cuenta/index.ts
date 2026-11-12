// Contrato de cuenta de la API (identidad.md, ordenes). JSON en snake_case, sin conversión.

/** GET y PUT /cuenta/perfil. */
export interface PerfilCuentaDto {
  id: string
  correo_electronico: string
  nombres: string
  apellidos: string
  telefono?: string | null
  es_administrador_plataforma: boolean
  /** Verificación en dos pasos (A-007): al iniciar sesión se pide además un código enviado al correo. */
  dos_pasos_activo?: boolean
  fecha_creacion: string
}

/** Elemento de GET /cuenta/direcciones. */
export interface DireccionDto {
  id: string
  nombre_contacto: string
  telefono?: string | null
  direccion_linea1: string
  direccion_linea2?: string | null
  ciudad: string
  estado_provincia: string
  codigo_postal: string
  pais: string
  /** Punto de entrega guardado (A-004); las direcciones antiguas no lo tienen. */
  latitud?: number | null
  longitud?: number | null
  es_principal: boolean
  fecha_creacion: string
}

/** Cuerpo de POST y PUT /cuenta/direcciones. */
export interface DireccionPayload {
  nombre_contacto: string
  telefono?: string
  direccion_linea1: string
  direccion_linea2?: string
  ciudad: string
  estado_provincia: string
  codigo_postal: string
  pais: string
  latitud?: number
  longitud?: number
  es_principal?: boolean
}

/** Elemento de la lista de GET /cuenta/ordenes (paginado). */
export interface OrdenCuentaDto {
  id: string
  numero_orden: string
  fecha_creacion: string
  tienda_id: string
  tienda_nombre: string
  tienda_subdominio: string
  total: number | string
  moneda: string
  estado: string
  estado_pago: string
  estado_preparacion: string
}

export interface ItemOrdenDto {
  titulo_producto: string
  titulo_variante?: string | null
  sku?: string | null
  precio_unitario: number | string
  cantidad: number
  total_linea: number | string
}

/** GET /cuenta/ordenes/{id}. Las direcciones van como objetos libres (la API no las tipa en la respuesta). */
export interface OrdenDetalleDto {
  numero_orden: string
  fecha_creacion: string
  nombre_cliente: string
  estado: string
  estado_pago: string
  estado_preparacion: string
  items: ItemOrdenDto[]
  subtotal: number | string
  descuento_total: number | string
  costo_envio: number | string
  impuestos_total: number | string
  total: number | string
  moneda: string
  direccion_envio?: Record<string, unknown> | null
  direccion_facturacion?: Record<string, unknown> | null
}
