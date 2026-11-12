// Contrato del panel general del propietario (B7) y de la administración de plataforma (B8), snake_case.

export interface TotalPorMoneda {
  moneda: string
  ventas: number
  ordenes: number
  saldo_pendiente: number
}

export interface PuntoSerieDia {
  moneda: string
  fecha: string
  ventas: number
  ordenes: number
}

export interface TiendaResumenPropietario {
  tienda_id: string
  nombre: string
  subdominio: string
  moneda: string
  estado_suscripcion: string
  codigo_plan: string
  operativa: boolean
  ventas: number
  ordenes: number
  saldo_pendiente: number
  alertas: { ordenes_por_preparar: number; stock_bajo: number }
}

/** GET /propietario/resumen: solo las tiendas de las que la persona es propietaria. Los totales van por moneda. */
export interface ResumenPropietario {
  desde: string
  hasta: string
  totales: TotalPorMoneda[]
  serie_dia: PuntoSerieDia[]
  tiendas: TiendaResumenPropietario[]
}

export interface TiendaAdminDto {
  id: string
  nombre: string
  subdominio: string
  esta_activa: boolean
  moneda: string
  duenio: { id: string; correo: string; nombre: string }
  codigo_plan: string
  estado_suscripcion: string
  ventas_historicas: number
  ordenes_pagadas: number
  fecha_creacion: string
}

export interface UsuarioAdminDto {
  id: string
  correo: string
  nombres: string
  apellidos: string
  esta_activo: boolean
  bloqueado: boolean
  bloqueado_hasta?: string | null
  dos_pasos_activo: boolean
  es_administrador_plataforma: boolean
  tiendas_propias: number
  fecha_creacion: string
}

export interface EventoAuditoriaDto {
  id: string
  categoria: "SEGURIDAD" | "NEGOCIO"
  accion: string
  entidad: string
  entidad_id?: string | null
  usuario_id?: string | null
  tienda_id?: string | null
  motivo?: string | null
  /** Objeto libre según la acción: {correo}, {antes, despues}, etc. */
  detalle?: Record<string, unknown> | null
  fecha: string
}
