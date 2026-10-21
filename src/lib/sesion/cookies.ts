// Solo servidor: nombres y opciones de las cookies de sesión. El JWT nunca sale de aquí hacia el navegador (W-003).
import type { NextRequest, NextResponse } from "next/server"

/** JWT de la API. httpOnly: el JavaScript de la página no lo puede leer. */
export const COOKIE_SESION = "otemu_sesion"
/** UUID de la tienda activa (X-Tienda-Id). También httpOnly. */
export const COOKIE_TIENDA = "otemu_tienda"
/** Prefijo de la cookie del token de carrito: una por tienda (`otemu_carrito_{subdominio}`). httpOnly (W-015). */
export const PREFIJO_COOKIE_CARRITO = "otemu_carrito_"

const DIAS_TIENDA = 30
const DIAS_CARRITO = 30

// Mismo formato de subdominio que la vitrina (TIE-001): se valida antes de componer el nombre de la cookie.
const SUBDOMINIO_VALIDO = /^[a-z0-9](-?[a-z0-9])*$/

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

/** Subdominio con el formato de la vitrina (≤ 63 caracteres). Cualquier otro valor no compone cookie. */
export function esSubdominioValido(subdominio: string): boolean {
  return subdominio.length <= 63 && SUBDOMINIO_VALIDO.test(subdominio)
}

export function nombreCookieCarrito(subdominio: string): string {
  return `${PREFIJO_COOKIE_CARRITO}${subdominio}`
}

/** Token del carrito de una tienda, o undefined si no hay cookie (o el subdominio no es válido). */
export function leerTokenCarrito(request: NextRequest, subdominio: string): string | undefined {
  if (!esSubdominioValido(subdominio)) return undefined
  return request.cookies.get(nombreCookieCarrito(subdominio))?.value
}

/** Todas las cookies de carrito de la petición: subdominio y token. Se usa al iniciar sesión (CAR-007). */
export function carritosDeLaPeticion(request: NextRequest): { subdominio: string; token: string }[] {
  return request.cookies
    .getAll()
    .filter((c) => c.name.startsWith(PREFIJO_COOKIE_CARRITO) && c.value !== "")
    .map((c) => ({ subdominio: c.name.slice(PREFIJO_COOKIE_CARRITO.length), token: c.value }))
    .filter((c) => esSubdominioValido(c.subdominio))
}

export function fijarCarrito(respuesta: NextResponse, subdominio: string, token: string) {
  if (!esSubdominioValido(subdominio)) return
  const expira = new Date(Date.now() + DIAS_CARRITO * 24 * 60 * 60 * 1000)
  respuesta.cookies.set(nombreCookieCarrito(subdominio), token, { ...base, expires: expira })
}

export function borrarCarrito(respuesta: NextResponse, subdominio: string) {
  if (!esSubdominioValido(subdominio)) return
  respuesta.cookies.set(nombreCookieCarrito(subdominio), "", { ...base, maxAge: 0 })
}
