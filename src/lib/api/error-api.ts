import type { ValidacionesApi } from "@/dtos/core/respuesta-api.dto"

export const CODIGO_CONEXION = "WEB-001"
export const MENSAJE_CONEXION = "No pudimos conectar con el servidor. Intenta de nuevo."

export interface DatosErrorApi {
  estado: number
  codigo: string
  mensaje: string
  validaciones?: ValidacionesApi
  detalles?: Record<string, unknown>
  idCorrelacion?: string
  /** Solo con GEN-429: segundos que indica el encabezado Retry-After. */
  retryAfterSegundos?: number
}

/**
 * Error de la API convertido para la web. `codigo` decide el comportamiento (p. ej. SEG-007 → login);
 * `mensaje` es el texto que se muestra tal cual; `validaciones` se pinta en los campos.
 * Nunca contiene el JWT ni el cuerpo de la petición.
 */
export class ErrorApi extends Error {
  readonly estado: number
  readonly codigo: string
  readonly validaciones?: ValidacionesApi
  readonly detalles?: Record<string, unknown>
  readonly idCorrelacion?: string
  readonly retryAfterSegundos?: number

  constructor(datos: DatosErrorApi) {
    super(datos.mensaje)
    this.name = "ErrorApi"
    this.estado = datos.estado
    this.codigo = datos.codigo
    this.validaciones = datos.validaciones
    this.detalles = datos.detalles
    this.idCorrelacion = datos.idCorrelacion
    this.retryAfterSegundos = datos.retryAfterSegundos
  }
}

/** Sin respuesta de la API (red caída, tiempo agotado): mismo código que devuelve el proxy al no alcanzar la API. */
export function errorDeConexion(): ErrorApi {
  return new ErrorApi({ estado: 502, codigo: CODIGO_CONEXION, mensaje: MENSAJE_CONEXION })
}

export const esErrorApi = (causa: unknown): causa is ErrorApi => causa instanceof ErrorApi
