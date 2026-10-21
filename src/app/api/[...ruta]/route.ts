// Proxy de mismo origen hacia la API Spring (/api/v1). El JWT vive en una cookie httpOnly y nunca llega al navegador.
// Solo reenvía a API_INTERNAL_URL; la URL de destino se construye con la ruta y la query, nada más.
import { randomUUID } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import {
  borrarCarrito,
  borrarSesion,
  borrarTienda,
  carritosDeLaPeticion,
  esSubdominioValido,
  fijarCarrito,
  fijarSesion,
  fijarTienda,
  leerTienda,
  leerToken,
  leerTokenCarrito,
} from "@/lib/sesion/cookies"
import { CODIGO_CONEXION, MENSAJE_CONEXION, respuestaError } from "@/lib/sesion/respuestas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TIMEOUT_MS = 15_000
const RUTA_LOGIN = "auth/login"
// El token del carrito no se acepta del navegador: sale solo de la cookie httpOnly de la tienda (W-015).
const CABECERAS_PERMITIDAS = ["content-type", "accept", "idempotency-key"] as const
// Cabeceras de la API que el navegador necesita además del cuerpo.
const CABECERAS_RESPUESTA = ["retry-after"] as const
// 6 MB: cubre la subida de imágenes de 5 MB (A-001) con margen para el multipart.
const MAX_CUERPO_BYTES = 6 * 1024 * 1024
const METODOS_LECTURA = new Set(["GET", "HEAD"])
// Id de correlación aceptado del cliente: corto y sin caracteres raros (va a los logs de la API).
const CORRELACION_VALIDA = /^[A-Za-z0-9-]{8,64}$/

type Contexto = { params: Promise<{ ruta: string[] }> }

const segmentoValido = (s: string) => s !== "" && s !== "." && s !== ".." && !/[/\\%]/.test(s)

function urlDestino(ruta: string[], search: string): URL | null {
  const base = (process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")
  const url = new URL(`/api/v1/${ruta.map(encodeURIComponent).join("/")}`, base)
  url.search = search
  return url
}

async function reenviar(request: NextRequest, ctx: Contexto): Promise<NextResponse> {
  const { ruta } = await ctx.params
  const recibido = request.headers.get("x-correlacion-id")
  const idCorrelacion = recibido && CORRELACION_VALIDA.test(recibido) ? recibido : randomUUID()

  // Defensa CSRF además de SameSite=Lax: una escritura con Origin de otro sitio no se reenvía.
  if (!METODOS_LECTURA.has(request.method) && !mismoOrigen(request)) {
    return respuestaError(403, "WEB-002", "Solicitud no permitida", { idCorrelacion })
  }
  const largo = Number(request.headers.get("content-length") ?? 0)
  if (largo > MAX_CUERPO_BYTES) {
    return respuestaError(413, "WEB-003", "El archivo o los datos enviados son demasiado grandes", { idCorrelacion })
  }

  if (ruta.length === 0 || !ruta.every(segmentoValido)) {
    return respuestaError(400, "GEN-400", "La ruta solicitada no es válida", { idCorrelacion })
  }
  const destino = urlDestino(ruta, request.nextUrl.search)
  if (!destino) return respuestaError(400, "GEN-400", "La ruta solicitada no es válida", { idCorrelacion })

  const cabeceras = new Headers()
  for (const nombre of CABECERAS_PERMITIDAS) {
    const valor = request.headers.get(nombre)
    if (valor) cabeceras.set(nombre, valor)
  }
  const token = leerToken(request)
  const tienda = leerTienda(request)
  if (token) cabeceras.set("Authorization", `Bearer ${token}`)
  if (tienda) cabeceras.set("X-Tienda-Id", tienda)
  // Carrito de la vitrina: el token sale de la cookie de esa tienda (nunca del navegador).
  const subCarrito = subdominioDeCarrito(ruta)
  const tokenCarrito = subCarrito ? leerTokenCarrito(request, subCarrito) : undefined
  if (tokenCarrito) cabeceras.set("X-Carrito-Token", tokenCarrito)
  cabeceras.set("X-Correlacion-Id", idCorrelacion)
  // IP real del visitante para el limitador de la API (A-002). Solo se confía si llega con el secreto compartido.
  const ipCliente = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const secretoProxy = process.env.API_PROXY_SECRETO
  if (ipCliente && secretoProxy) {
    cabeceras.set("X-Forwarded-For", ipCliente)
    cabeceras.set("X-Proxy-Secreto", secretoProxy)
  }

  const cuerpo = METODOS_LECTURA.has(request.method) ? undefined : await request.arrayBuffer()
  if (cuerpo && cuerpo.byteLength > MAX_CUERPO_BYTES) {
    return respuestaError(413, "WEB-003", "El archivo o los datos enviados son demasiado grandes", { idCorrelacion })
  }

  let respuestaApi: Response
  try {
    respuestaApi = await fetch(destino, {
      method: request.method,
      headers: cabeceras,
      body: cuerpo,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    // Sin detalles de red: no se expone la dirección interna ni el motivo.
    return respuestaError(502, CODIGO_CONEXION, MENSAJE_CONEXION, { idCorrelacion })
  }

  const tipo = respuestaApi.headers.get("content-type") ?? "application/json"
  const bytes = await respuestaApi.arrayBuffer()
  const respuesta = new NextResponse(bytes, {
    status: respuestaApi.status,
    headers: { "Content-Type": tipo, "X-Correlacion-Id": idCorrelacion },
  })
  for (const nombre of CABECERAS_RESPUESTA) {
    const valor = respuestaApi.headers.get(nombre)
    if (valor) respuesta.headers.set(nombre, valor)
  }

  if (subCarrito) actualizarCookieCarrito(respuesta, subCarrito, respuestaApi.status, bytes)

  const rutaTexto = ruta.join("/")
  const esLogin = rutaTexto === RUTA_LOGIN && request.method === "POST"

  if (esLogin && respuestaApi.status === 200) {
    return await sesionDesdeLogin(request, respuesta, bytes, idCorrelacion)
  }
  if (respuestaApi.status === 401 && token) {
    borrarSesion(respuesta)
  }
  return respuesta
}

/** El Origin (si el navegador lo envía) debe ser el de la propia web. Sin Origin (curl, servidor) se permite. */
function mismoOrigen(request: NextRequest): boolean {
  const origen = request.headers.get("origin")
  if (!origen) return true
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  try {
    return new URL(origen).host === host
  } catch {
    return false
  }
}

/** Subdominio de una ruta `vitrina/{sub}/carrito…`, o null si la ruta no es del carrito. */
function subdominioDeCarrito(ruta: string[]): string | null {
  if (ruta.length < 3 || ruta[0] !== "vitrina" || ruta[2] !== "carrito") return null
  return esSubdominioValido(ruta[1]) ? ruta[1] : null
}

function cuerpoJson(bytes: ArrayBuffer): Record<string, unknown> | null {
  try {
    const cuerpo = JSON.parse(new TextDecoder().decode(bytes))
    return cuerpo && typeof cuerpo === "object" ? (cuerpo as Record<string, unknown>) : null
  } catch {
    return null
  }
}

// Carrito convertido (CAR-008, 409) o carrito no encontrado (404 con código CAR-…): la cookie ya no sirve.
function actualizarCookieCarrito(respuesta: NextResponse, subdominio: string, estado: number, bytes: ArrayBuffer) {
  if (estado >= 200 && estado < 300) {
    const datos = cuerpoJson(bytes)?.datos as { token?: unknown } | undefined
    if (typeof datos?.token === "string") fijarCarrito(respuesta, subdominio, datos.token)
    return
  }
  const codigo = cuerpoJson(bytes)?.codigo
  if (typeof codigo !== "string") return
  if (codigo === "CAR-008" || (estado === 404 && codigo.startsWith("CAR-"))) {
    borrarCarrito(respuesta, subdominio)
  }
}

const TIMEOUT_VINCULAR_MS = 5_000
// Tope de carritos a vincular por login: cada uno es una llamada a la API y el login la espera.
const MAX_CARRITOS_VINCULAR = 10

/** Fusiona los carritos anónimos del navegador con la cuenta recién autenticada (CAR-007). Mejor esfuerzo: no bloquea el login. */
async function vincularCarritos(request: NextRequest, token: string): Promise<void> {
  for (const carrito of carritosDeLaPeticion(request).slice(0, MAX_CARRITOS_VINCULAR)) {
    const destino = urlDestino(["vitrina", carrito.subdominio, "carrito", "vincular"], "")
    if (!destino) continue
    try {
      await fetch(destino, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-Carrito-Token": carrito.token, "X-Correlacion-Id": randomUUID() },
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_VINCULAR_MS),
      })
    } catch {
      // Sin efecto en el login: el carrito anónimo sigue en su cookie.
    }
  }
}

// En el login la API devuelve el token en el cuerpo: se guarda en cookie y se quita antes de responder.
async function sesionDesdeLogin(
  request: NextRequest,
  respuesta: NextResponse,
  bytes: ArrayBuffer,
  idCorrelacion: string,
): Promise<NextResponse> {
  let cuerpo: { exito?: boolean; datos?: Record<string, unknown> } & Record<string, unknown>
  try {
    cuerpo = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return respuestaError(502, CODIGO_CONEXION, MENSAJE_CONEXION, { idCorrelacion })
  }
  const datos = cuerpo.datos ?? {}
  const token = typeof datos.token === "string" ? datos.token : undefined
  const expiraEn = typeof datos.expira_en === "string" ? datos.expira_en : undefined
  if (!token || !expiraEn) return respuestaError(502, CODIGO_CONEXION, MENSAJE_CONEXION, { idCorrelacion })

  const { token: _descartado, ...datosSinToken } = datos
  void _descartado
  const tiendas = Array.isArray(datos.tiendas) ? (datos.tiendas as { tienda_id?: string }[]) : []

  // Con exactamente una tienda se activa sola; con varias, el usuario elige (PUT /api/sesion).
  const salida = NextResponse.json(
    { ...cuerpo, datos: datosSinToken },
    { status: 200, headers: { "X-Correlacion-Id": idCorrelacion } },
  )
  fijarSesion(salida, token, expiraEn)
  if (tiendas.length === 1 && typeof tiendas[0].tienda_id === "string") {
    fijarTienda(salida, tiendas[0].tienda_id)
  } else {
    borrarTienda(salida)
  }
  await vincularCarritos(request, token)
  return salida
}

export const GET = reenviar
export const POST = reenviar
export const PUT = reenviar
export const PATCH = reenviar
export const DELETE = reenviar
