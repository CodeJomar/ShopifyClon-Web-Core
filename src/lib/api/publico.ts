import type { RespuestaApi } from "@/dtos/core/respuesta-api.dto"
import { ErrorApi, errorDeConexion } from "@/lib/api/error-api"

const TIMEOUT_MS = 15_000

/**
 * Cliente HTTP exclusivo del servidor para recursos públicos de la vitrina.
 * Consulta `${API_INTERNAL_URL}/api/v1/vitrina/...` con `cache: "no-store"`.
 * Solo rutas que pertenezcan a vitrina/..., solo método GET, sin cookies ni Authorization.
 */
export async function obtenerPublico<T>(ruta: string): Promise<T> {
  const base = (process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")

  // Normalizar ruta para asegurar que pertenezca a /api/v1/vitrina/...
  const rutaLimpia = ruta.replace(/^\//, "")
  const rutaFinal = rutaLimpia.startsWith("vitrina/")
    ? rutaLimpia
    : `vitrina/${rutaLimpia}`

  // Validación: solo rutas de vitrina
  if (!rutaFinal.startsWith("vitrina/")) {
    throw new ErrorApi({
      estado: 400,
      codigo: "WEB-004",
      mensaje: "Solo se permiten consultas a la vitrina pública",
    })
  }

  const url = `${base}/api/v1/${rutaFinal}`

  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw errorDeConexion()
  }

  let cuerpo: RespuestaApi<T>
  try {
    cuerpo = (await respuesta.json()) as RespuestaApi<T>
  } catch {
    throw errorDeConexion()
  }

  if (!respuesta.ok || !cuerpo.exito) {
    throw new ErrorApi({
      estado: respuesta.status,
      codigo: cuerpo.codigo ?? `HTTP-${respuesta.status}`,
      mensaje: cuerpo.mensaje ?? "No se pudo obtener la información pública",
      validaciones: cuerpo.validaciones,
      detalles: cuerpo.detalles,
      idCorrelacion: cuerpo.id_correlacion,
    })
  }

  return cuerpo.datos as T
}
