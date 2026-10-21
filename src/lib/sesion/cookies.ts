// Solo servidor: nombres y opciones de las cookies de sesión. El JWT nunca sale de aquí hacia el navegador (W-003).
import type { NextRequest, NextResponse } from "next/server"

/** JWT de la API. httpOnly: el JavaScript de la página no lo puede leer. */
export const COOKIE_SESION = "otemu_sesion"
/** UUID de la tienda activa (X-Tienda-Id). También httpOnly. */
export const COOKIE_TIENDA = "otemu_tienda"

const DIAS_TIENDA = 30

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
}

export function leerToken(request: NextRequest): string | undefined {
  return request.cookies.get(COOKIE_SESION)?.value
}

export function leerTienda(request: NextRequest): string | undefined {
  return request.cookies.get(COOKIE_TIENDA)?.value
}

/** Guarda el JWT hasta su vencimiento (`expira_en`, ISO UTC que entrega la API). */
export function fijarSesion(respuesta: NextResponse, token: string, expiraEn: string) {
  const expira = new Date(expiraEn)
  respuesta.cookies.set(COOKIE_SESION, token, { ...base, expires: expira })
}

export function fijarTienda(respuesta: NextResponse, tiendaId: string) {
  const expira = new Date(Date.now() + DIAS_TIENDA * 24 * 60 * 60 * 1000)
  respuesta.cookies.set(COOKIE_TIENDA, tiendaId, { ...base, expires: expira })
}

export function borrarSesion(respuesta: NextResponse) {
  respuesta.cookies.set(COOKIE_SESION, "", { ...base, maxAge: 0 })
}

export function borrarTienda(respuesta: NextResponse) {
  respuesta.cookies.set(COOKIE_TIENDA, "", { ...base, maxAge: 0 })
}
