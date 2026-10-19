/** Ruta de la web que Next reenvía al /health de la API (ver next.config.ts). Es pública: no exige sesión. */
const RUTA_ESTADO_API = "/estado-api"

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
