import { esErrorApi, errorDeConexion, type ErrorApi } from "./error-api"

/**
 * Resultado de una petición para quien la llama: éxito con `datos`, o error con `error`.
 * Así el flujo se decide sin excepciones (`if (res.ok)`). Nunca contiene el JWT.
 */
export type Resultado<T> =
  | { ok: true; datos: T; estado: number; mensaje: string }
  | { ok: false; error: ErrorApi; estado: number; mensaje: string }

export async function resultado<T>(peticion: Promise<T>): Promise<Resultado<T>> {
  try {
    const datos = await peticion
    return { ok: true, datos, estado: 200, mensaje: "" }
  } catch (causa) {
    const error = esErrorApi(causa) ? causa : errorDeConexion()
    return { ok: false, error, estado: error.estado, mensaje: error.message }
  }
}
