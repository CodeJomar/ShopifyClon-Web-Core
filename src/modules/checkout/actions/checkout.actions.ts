import { api, peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { RespuestaApi } from "@/dtos/core/respuesta-api.dto"
import type { CheckoutRequest, IniciarPagoStripe, OrdenCreada, OrdenPublica, TarifaEnvioVitrina } from "@/dtos/checkout"
import type { DireccionDto, PerfilCuentaDto } from "@/dtos/cuenta"

// Checkout de la vitrina. La web no calcula montos: el total que envía es el que devolvió la API en el carrito.
// El token del carrito sale de su cookie (lo pone el proxy); la clave de idempotencia la pasa quien llama.

export const tarifasEnvioAction = (subdominio: string) =>
  resultado(peticionApi<TarifaEnvioVitrina[]>({ method: "GET", url: `/vitrina/${encodeURIComponent(subdominio)}/tarifas-envio` }))

/** Crea la orden. Una misma `claveIdempotencia` reintentada devuelve la misma orden (la API no la duplica). */
export const crearOrdenAction = (subdominio: string, claveIdempotencia: string, datos: CheckoutRequest) =>
  resultado(
    peticionApi<OrdenCreada>({
      method: "POST",
      url: `/vitrina/${encodeURIComponent(subdominio)}/checkout`,
      data: datos,
      headers: { "Idempotency-Key": claveIdempotencia },
    }),
  )

/** Inicia el pago en línea (solo órdenes con pasarela STRIPE pendientes): devuelve el secreto del intento de Stripe. */
export const iniciarPagoStripeAction = (subdominio: string, tokenAcceso: string) =>
  resultado(
    peticionApi<IniciarPagoStripe>({
      method: "POST",
      url: `/vitrina/${encodeURIComponent(subdominio)}/ordenes/${encodeURIComponent(tokenAcceso)}/pagar`,
    }),
  )

export const ordenPublicaAction = (subdominio: string, tokenAcceso: string) =>
  resultado(
    peticionApi<OrdenPublica>({
      method: "GET",
      url: `/vitrina/${encodeURIComponent(subdominio)}/ordenes/${encodeURIComponent(tokenAcceso)}`,
    }),
  )

/**
 * Perfil y direcciones para prellenar el checkout, solo si hay sesión. Sin sesión (401) devuelve null sin
 * redirigir: el invitado puede comprar igual. Se usa el cliente directo y no `peticionApi`, que lleva al login.
 */
export async function datosDeSesionParaCheckout(): Promise<{ perfil: PerfilCuentaDto; direcciones: DireccionDto[] } | null> {
  try {
    const [perfil, direcciones] = await Promise.all([
      api.get<RespuestaApi<PerfilCuentaDto>>("/cuenta/perfil"),
      api.get<RespuestaApi<DireccionDto[]>>("/cuenta/direcciones"),
    ])
    return { perfil: perfil.data.datos as PerfilCuentaDto, direcciones: (direcciones.data.datos as DireccionDto[]) ?? [] }
  } catch {
    return null
  }
}
