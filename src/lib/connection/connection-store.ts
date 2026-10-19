/**
 * Estado de la conexión de la app, fuera de React para que lo pueda actualizar el cliente HTTP (axios) y lo pueda
 * leer la interfaz (useSyncExternalStore). Es una fuente única: nadie más decide si "hay conexión".
 */
export interface EstadoConexion {
  /** El navegador no tiene red (cable o Wi‑Fi caído, modo avión). */
  sinInternet: boolean
  /** Hay red, pero el servidor (API) no responde. */
  apiCaida: boolean
}

const INICIAL: EstadoConexion = { sinInternet: false, apiCaida: false }

let estado: EstadoConexion = INICIAL
const oyentes = new Set<() => void>()

function cambiar(siguiente: Partial<EstadoConexion>) {
  const nuevo = { ...estado, ...siguiente }
  if (nuevo.sinInternet === estado.sinInternet && nuevo.apiCaida === estado.apiCaida) return
  estado = nuevo
  oyentes.forEach((avisar) => avisar())
}

export const conexion = {
  /** Para useSyncExternalStore. */
  suscribir(oyente: () => void) {
    oyentes.add(oyente)
    return () => oyentes.delete(oyente)
  },
  leer: (): EstadoConexion => estado,
  /** En el servidor (SSR) la app siempre se considera conectada. */
  leerServidor: (): EstadoConexion => INICIAL,

  marcarSinInternet: () => cambiar({ sinInternet: true }),
  marcarConInternet: () => cambiar({ sinInternet: false }),
  marcarApiCaida: () => cambiar({ apiCaida: true }),
  marcarApiOperativa: () => cambiar({ apiCaida: false }),
}
