// Contrato real de la API Spring (docs/negocio/modulos/transversal.md). JSON en snake_case, sin conversión.

/** Errores de validación por campo (VAL-001): campo → mensaje. */
export type ValidacionesApi = Record<string, string>

/** Sobre único de toda respuesta de la API. Los nulos se omiten. */
export interface RespuestaApi<T = unknown> {
  exito: boolean
  codigo_estado: number
  /** Solo en error: código estable (`XXX-000`). */
  codigo?: string
  mensaje?: string
  /** Solo en éxito. */
  datos?: T
  detalles?: Record<string, unknown>
  /** Solo con VAL-001. */
  validaciones?: ValidacionesApi
  /** Solo en error: ruta que falló. */
  ruta?: string
  id_correlacion?: string
  marca_tiempo: string
}

/** Respuesta paginada: va dentro de `datos` de la respuesta. */
export interface Paginado<T> {
  datos: T[]
  total: number
  pagina_actual: number
  tamano_pagina: number
  total_paginas: number
  tiene_mas_paginas: boolean
  marca_tiempo: string
}
