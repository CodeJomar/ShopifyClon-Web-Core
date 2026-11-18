// Contrato de reseñas y calificaciones (R-011, docs/rediseno/03-resenas-y-calificaciones.md), snake_case.

export interface ResumenResenas {
  promedio: number | null
  total: number
  /** Cantidad de reseñas por calificación: claves "1" a "5". */
  distribucion: Record<string, number>
}

export interface ResenaDto {
  id: string
  calificacion: number
  comentario?: string | null
  /** Nombre y la inicial del apellido («Ana P.»); nunca el correo. */
  autor: string
  compra_verificada: boolean
  fecha: string
}

export interface MiResenaDto {
  id: string
  calificacion: number
  comentario?: string | null
  fecha: string
}

export interface RespuestaResenas {
  resumen: ResumenResenas
  mi_resena?: MiResenaDto | null
  puedo_resenar: boolean
  pagina: {
    datos: ResenaDto[]
    total: number
    pagina_actual: number
    total_paginas: number
  }
}

export type OrdenResenas = "recientes" | "mejores" | "peores"
