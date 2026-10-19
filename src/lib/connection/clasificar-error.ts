import axios from "axios"

const ESTADOS_SERVIDOR_NO_DISPONIBLE = new Set([502, 503, 504])

/** ¿El cuerpo parece una respuesta de nuestra API ({ status, mensajes, ... })? Los errores del proxy o de red no lo son. */
function esRespuestaDeApi(data: unknown): boolean {
  return typeof data === "object" && data !== null && ("status" in data || "mensajes" in data)
}

/**
 * ¿Este error de axios significa que no se pudo hablar con la API?
 *  - sin respuesta (red caída, servidor apagado, tiempo agotado);
 *  - 502/503/504 (el balanceador o la API no están disponibles);
 *  - 500 que NO trae el formato de la API (el proxy de la web no pudo conectar con ella).
 * Un error de negocio (400, 403, 409, 429…) o un 500 propio de la API NO cuentan: la API está viva.
 */
export function esFalloDeConexion(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  const respuesta = error.response
  if (!respuesta) return error.code !== "ERR_CANCELED"
  if (ESTADOS_SERVIDOR_NO_DISPONIBLE.has(respuesta.status)) return true
  return respuesta.status === 500 && !esRespuestaDeApi(respuesta.data)
}
