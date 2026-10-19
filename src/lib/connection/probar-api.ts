/** Ruta de la web que Next reenvía a la API Spring (ver next.config.ts). Debe ser pública: no exige sesión. */
// TODO(Q-W-001): la API Spring no tiene /health; se usa GET /api/planes como latido. Confirmar que es pública.
const RUTA_ESTADO_API = "/api/planes"

/** Pregunta a la API si está viva. true = responde; false = sin respuesta, tiempo agotado o error del servidor. */
export async function probarApi(tiempoMaximoMs = 4000): Promise<boolean> {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), tiempoMaximoMs)
  try {
    const respuesta = await fetch(RUTA_ESTADO_API, { cache: "no-store", signal: control.signal })
    return respuesta.ok
  } catch {
    return false
  } finally {
    clearTimeout(temporizador)
  }
}
