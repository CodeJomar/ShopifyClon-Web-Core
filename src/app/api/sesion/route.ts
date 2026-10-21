// Rutas propias de sesión de la web (no van a la API). Tienen prioridad sobre el proxy /api/[...ruta].
import { randomUUID } from "node:crypto"
import type { NextRequest } from "next/server"
import { borrarSesion, borrarTienda, fijarTienda } from "@/lib/sesion/cookies"
import { respuestaError, respuestaExito } from "@/lib/sesion/respuestas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Cierra sesión: borra el JWT y la tienda activa. La API no tiene logout. */
export async function DELETE(request: NextRequest) {
  const idCorrelacion = request.headers.get("x-correlacion-id") ?? randomUUID()
  const salida = respuestaExito(undefined, 200, "Sesión cerrada")
  borrarSesion(salida)
  borrarTienda(salida)
  salida.headers.set("X-Correlacion-Id", idCorrelacion)
  return salida
}

/** Fija la tienda activa. La pertenencia la valida la API en cada uso (SEG-001). */
export async function PUT(request: NextRequest) {
  const idCorrelacion = request.headers.get("x-correlacion-id") ?? randomUUID()
  let cuerpo: { tienda_id?: unknown }
  try {
    cuerpo = await request.json()
  } catch {
    return respuestaError(400, "VAL-002", "No pudimos leer los datos enviados", { idCorrelacion })
  }
  if (typeof cuerpo.tienda_id !== "string" || !UUID.test(cuerpo.tienda_id)) {
    return respuestaError(400, "VAL-003", 'El parámetro «tienda_id» no tiene un formato válido', {
      validaciones: { tienda_id: "Indica una tienda válida" },
      idCorrelacion,
    })
  }
  const salida = respuestaExito(undefined, 200, "Tienda activa actualizada")
  fijarTienda(salida, cuerpo.tienda_id)
  salida.headers.set("X-Correlacion-Id", idCorrelacion)
  return salida
}
