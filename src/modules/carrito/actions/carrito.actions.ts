import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Carrito } from "@/dtos/carrito"

// Carrito de la vitrina. Es público: el token vive en la cookie httpOnly de la tienda (la añade el proxy).
// La web no calcula montos: todo lo que se muestra sale de la respuesta de la API.

const base = (subdominio: string) => `/vitrina/${encodeURIComponent(subdominio)}/carrito`

/** Obtiene el carrito de la tienda, o crea uno si no existe (el token nuevo queda en la cookie). */
export const crearCarritoAction = (subdominio: string) =>
  resultado(peticionApi<Carrito>({ method: "POST", url: base(subdominio) }))

/**
 * Carrito, o su cotización con la tarifa de envío elegida (`tarifaEnvioId`): la API devuelve `costo_envio` y el
 * `total_estimado` con envío, idéntico al que calcula el checkout (A-003).
 */
export const obtenerCarritoAction = (subdominio: string, tarifaEnvioId?: string) =>
  resultado(
    peticionApi<Carrito>({
      method: "GET",
      url: base(subdominio),
      params: tarifaEnvioId ? { tarifa_envio_id: tarifaEnvioId } : undefined,
    }),
  )

export const agregarItemAction = (subdominio: string, varianteId: string, cantidad: number) =>
  resultado(peticionApi<Carrito>({ method: "POST", url: `${base(subdominio)}/items`, data: { variante_id: varianteId, cantidad } }))

/** Cantidad 0 quita la línea (la API lo interpreta así). */
export const cambiarCantidadAction = (subdominio: string, varianteId: string, cantidad: number) =>
  resultado(peticionApi<Carrito>({ method: "PUT", url: `${base(subdominio)}/items/${varianteId}`, data: { cantidad } }))

export const quitarItemAction = (subdominio: string, varianteId: string) =>
  resultado(peticionApi<Carrito>({ method: "DELETE", url: `${base(subdominio)}/items/${varianteId}` }))

export const aplicarCuponAction = (subdominio: string, codigo: string) =>
  resultado(peticionApi<Carrito>({ method: "PUT", url: `${base(subdominio)}/cupon`, data: { codigo } }))

export const quitarCuponAction = (subdominio: string) =>
  resultado(peticionApi<Carrito>({ method: "DELETE", url: `${base(subdominio)}/cupon` }))

/** Avisa a los componentes que muestran el carrito (icono del encabezado, página) que cambió. */
export const CAMBIO_CARRITO = "otemu:carrito-cambio"
export function avisarCambioCarrito(subdominio: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CAMBIO_CARRITO, { detail: { subdominio } }))
}
