import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type {
  ActualizarPlanRequest,
  ComisionTiendaDto,
  ConsultaPaginadaDto,
  CrearPlanRequest,
  MotivoTiendaRequest,
  PlanPlataformaDto,
  SuscripcionPlataformaDto,
} from "@/dtos/plataforma"

// Llamadas a la API real de plataforma (solo administradores de plataforma). No usan X-Tienda-Id.

/** Lista todos los planes del catálogo, incluidos los no públicos. */
export const listarPlanesAction = () =>
  resultado(peticionApi<PlanPlataformaDto[]>({ method: "GET", url: "/plataforma/planes" }))

/** Crea un nuevo plan de suscripción en la plataforma. */
export const crearPlanAction = (datos: CrearPlanRequest) =>
  resultado(peticionApi<PlanPlataformaDto>({ method: "POST", url: "/plataforma/planes", data: datos }))

/** Actualiza un plan existente. El código no se modifica. */
export const actualizarPlanAction = (codigo: string, datos: ActualizarPlanRequest) =>
  resultado(peticionApi<PlanPlataformaDto>({ method: "PUT", url: `/plataforma/planes/${codigo}`, data: datos }))

/** Retira un plan del catálogo público (es_publico = false; SUS-013). */
export const eliminarPlanAction = (codigo: string) =>
  resultado(peticionApi<void>({ method: "DELETE", url: `/plataforma/planes/${codigo}` }))

/** Lista suscripciones de todas las tiendas, con filtro opcional por estado y paginación. */
export const listarSuscripcionesAction = (params?: { estado?: string; pagina?: number }) =>
  resultado(
    peticionApi<ConsultaPaginadaDto<SuscripcionPlataformaDto>>({
      method: "GET",
      url: "/plataforma/suscripciones",
      params: {
        ...(params?.estado ? { estado: params.estado } : {}),
        pagina: params?.pagina ?? 0,
      },
    }),
  )

/** Suspende una tienda por motivo justificado (SUS-010). */
export const suspenderTiendaAction = (tiendaId: string, datos: MotivoTiendaRequest) =>
  resultado(peticionApi<void>({ method: "POST", url: `/plataforma/tiendas/${tiendaId}/suspender`, data: datos }))

/** Reactiva una tienda suspendida, regresándola a su estado previo. */
export const reactivarTiendaAction = (tiendaId: string, datos: MotivoTiendaRequest) =>
  resultado(peticionApi<void>({ method: "POST", url: `/plataforma/tiendas/${tiendaId}/reactivar`, data: datos }))

/** Consulta las comisiones de la plataforma por tienda, ordenadas de mayor a menor. */
export const listarComisionesAction = (params?: { pagina?: number }) =>
  resultado(
    peticionApi<ConsultaPaginadaDto<ComisionTiendaDto>>({
      method: "GET",
      url: "/plataforma/metricas/comisiones",
      params: {
        pagina: params?.pagina ?? 0,
      },
    }),
  )
