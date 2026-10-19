/**
 * Aviso global de que la sesión de este navegador se cerró porque la misma cuenta inició sesión en otro lugar.
 * Lo emite el cliente HTTP cuando la API responde 401 con el motivo `sesion_reemplazada`; el workspace lo escucha,
 * cierra la sesión de inmediato y vuelve al login con un toast que explica lo ocurrido. Mientras está activo, ninguna
 * otra petición redirige por su cuenta.
 */
export const MOTIVO_SESION_REEMPLAZADA = "sesion_reemplazada"
export const EVENTO_SESION_REEMPLAZADA = "cf:sesion-reemplazada"

let activa = false

export const sesionReemplazada = (): boolean => activa

export function marcarSesionReemplazada(): void {
  if (activa || typeof window === "undefined") return
  activa = true
  window.dispatchEvent(new Event(EVENTO_SESION_REEMPLAZADA))
}
