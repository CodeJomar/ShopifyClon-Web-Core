import axios, { isAxiosError, type AxiosRequestConfig } from "axios"
import type { RespuestaApi } from "@/dtos/core/respuesta-api.dto"
import { conexion, esFalloDeConexion } from "@/lib/connection"
import { ErrorApi, errorDeConexion } from "./error-api"
import { toast } from "@/shared/components/ui/toast"

/** Mismo origen: el proxy de la web (src/app/api/[...ruta]) reenvía a la API Spring. El navegador nunca ve el JWT. */
export const RUTA_API = "/api"

export const api = axios.create({
  baseURL: RUTA_API,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

// Cualquier respuesta de la API (aunque sea un error de negocio) prueba que está viva; sin respuesta se muestra el aviso.
api.interceptors.response.use(
  (respuesta) => {
    conexion.marcarApiOperativa()
    return respuesta
  },
  (error: unknown) => {
    if (esFalloDeConexion(error)) conexion.marcarApiCaida()
    else if (isAxiosError(error) && error.response) conexion.marcarApiOperativa()
    throw error
  },
)

// Las acciones pasan la ruta con o sin "/" inicial ("/auth/login"): se normaliza antes de comparar.
const esRutaAuth = (url: string | undefined) => (url ?? "").replace(/^\/+/, "").startsWith("auth/")

function aErrorApi(error: unknown): ErrorApi {
  if (isAxiosError(error) && error.response) {
    const cuerpo = error.response.data as Partial<RespuestaApi> | undefined
    return new ErrorApi({
      estado: error.response.status,
      codigo: cuerpo?.codigo ?? `GEN-${error.response.status}`,
      mensaje: cuerpo?.mensaje ?? "Ocurrió un error inesperado.",
      validaciones: cuerpo?.validaciones,
      detalles: cuerpo?.detalles,
      idCorrelacion: cuerpo?.id_correlacion,
      retryAfterSegundos: Number(error.response.headers["retry-after"]) || undefined,
    })
  }
  return errorDeConexion()
}

/**
 * Ejecuta una petición contra /api y devuelve `datos` ya desempaquetados de `RespuestaApi`.
 * Lanza `ErrorApi`. Un 401 fuera de `auth/*` lleva al login conservando la pantalla de destino.
 */
export async function peticionApi<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const { data } = await api.request<RespuestaApi<T>>(config)
    return data.datos as T
  } catch (error) {
    const errorApi = aErrorApi(error)
    // SUS-017: la suscripción de la tienda no está activa; las escrituras se rechazan con el mensaje de la API.
    if (errorApi.codigo === "SUS-017") toast.add({ type: "warning", title: "Suscripción no activa", description: errorApi.message })
    if (errorApi.estado === 401 && !esRutaAuth(config.url) && typeof window !== "undefined") {
      window.location.replace(`/login?siguiente=${encodeURIComponent(window.location.pathname)}`)
    }
    throw errorApi
  }
}
