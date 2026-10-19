import { esCodigoConocido, type CodigoError } from "./catalogo"

type ErrorConEstado = { status?: unknown; statusCode?: unknown; httpStatusCode?: unknown; message?: unknown }

const aNumero = (valor: unknown) => (typeof valor === "number" ? valor : undefined)

/**
 * Deduce qué pantalla corresponde a un error: primero el código HTTP si lo trae (`status`, `statusCode` o
 * `httpStatusCode`, que es el que deja `apiRequest`), después el texto del mensaje. Lo demás es un 500.
 */
export function codigoDeError(error: unknown): CodigoError {
  if (typeof error === "number") return esCodigoConocido(error) ? error : 500
  if (!error || typeof error !== "object") return 500

  const { status, statusCode, httpStatusCode, message } = error as ErrorConEstado
  const codigo = aNumero(status) ?? aNumero(statusCode) ?? aNumero(httpStatusCode)
  if (codigo !== undefined && esCodigoConocido(codigo)) return codigo

  const texto = typeof message === "string" ? message.toLowerCase() : ""
  if (/\b404\b|not found|no encontrad/.test(texto)) return 404
  if (/\b403\b|forbidden|denegado|unauthorized|sin permiso/.test(texto)) return 403
  if (/\b429\b|too many|rate limit|demasiadas/.test(texto)) return 429
  return 500
}
