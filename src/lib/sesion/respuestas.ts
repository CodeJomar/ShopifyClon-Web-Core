// Solo servidor: respuestas del propio proxy con el formato RespuestaApi (docs/negocio/modulos/transversal.md).
import { NextResponse } from "next/server"

export const CODIGO_CONEXION = "WEB-001"
export const MENSAJE_CONEXION = "No pudimos conectar con el servidor. Intenta de nuevo."

export function respuestaError(
  estado: number,
  codigo: string,
  mensaje: string,
  extra: { validaciones?: Record<string, string>; idCorrelacion?: string; ruta?: string } = {},
): NextResponse {
  return NextResponse.json(
    {
      exito: false,
      codigo_estado: estado,
      codigo,
      mensaje,
      ...(extra.validaciones ? { validaciones: extra.validaciones } : {}),
      ...(extra.ruta ? { ruta: extra.ruta } : {}),
      ...(extra.idCorrelacion ? { id_correlacion: extra.idCorrelacion } : {}),
      marca_tiempo: new Date().toISOString(),
    },
    { status: estado },
  )
}

export function respuestaExito(datos: unknown, estado = 200, mensaje?: string): NextResponse {
  return NextResponse.json(
    {
      exito: true,
      codigo_estado: estado,
      ...(mensaje ? { mensaje } : {}),
      ...(datos !== undefined ? { datos } : {}),
      marca_tiempo: new Date().toISOString(),
    },
    { status: estado },
  )
}
