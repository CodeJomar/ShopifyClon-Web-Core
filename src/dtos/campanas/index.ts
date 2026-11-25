// Contrato de campañas (backend): descuento automático por tramos de precio, calculado siempre por el servidor.

export interface TramoCampanaDto {
  /** Precio unitario de lista desde el cual aplica este porcentaje (en la moneda de la tienda). */
  desde: number
  porcentaje: number
}

/** GET /campanas/activa (público). Sin campaña: `activa=false` y `codigo`/`nombre` ausentes. */
export interface CampanaActivaDto {
  activa: boolean
  codigo?: string
  nombre?: string
  tramos: TramoCampanaDto[]
}

export interface CampanaDisponibleDto {
  codigo: string
  nombre: string
}

/** GET /plataforma/campanas (permiso PLATAFORMA_PLANES). */
export interface CampanasAdminDto {
  activa?: CampanaDisponibleDto | null
  disponibles: CampanaDisponibleDto[]
  tramos: TramoCampanaDto[]
}
