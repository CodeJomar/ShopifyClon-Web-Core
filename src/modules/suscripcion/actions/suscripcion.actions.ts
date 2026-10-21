import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { PlanDto } from "@/dtos/tienda"
import type {
  CambiarPlanRequest,
  CancelarSuscripcionRequest,
  PagarSuscripcionRequest,
  SuscripcionPanelDto,
} from "@/dtos/suscripcion"

// Llamadas a la API real (suscripciones.md). Todo pasa por /api: el JWT y la tienda activa viven en cookies httpOnly.

/** Suscripción de la tienda activa (solo PROPIETARIO, permiso SUSCRIPCION_GESTIONAR). */
export const suscripcionAction = () =>
  resultado(peticionApi<SuscripcionPanelDto>({ method: "GET", url: "/panel/suscripcion" }))

/** Catálogo de planes públicos de la plataforma. */
export const planesAction = () =>
  resultado(peticionApi<PlanDto[]>({ method: "GET", url: "/planes" }))

/** Paga o reactiva la suscripción actual. */
export const pagarSuscripcionAction = (datos: PagarSuscripcionRequest) =>
  resultado(peticionApi<SuscripcionPanelDto>({ method: "POST", url: "/panel/suscripcion/pagar", data: datos }))

/** Cambia el plan de suscripción (inmediato, nuevo período). */
export const cambiarPlanAction = (datos: CambiarPlanRequest) =>
  resultado(peticionApi<SuscripcionPanelDto>({ method: "POST", url: "/panel/suscripcion/cambiar-plan", data: datos }))

/** Cancela la suscripción con un motivo (inmediato en PRUEBA, al fin de periodo en ACTIVA). */
export const cancelarSuscripcionAction = (datos: CancelarSuscripcionRequest) =>
  resultado(peticionApi<SuscripcionPanelDto | void>({ method: "POST", url: "/panel/suscripcion/cancelar", data: datos }))

/** Revierte la cancelación programada al fin de período. */
export const revertirCancelacionAction = () =>
  resultado(peticionApi<SuscripcionPanelDto>({ method: "POST", url: "/panel/suscripcion/revertir-cancelacion" }))
