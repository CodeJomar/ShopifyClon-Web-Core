// Proxy de mismo origen hacia la API Spring (/api/v1). El JWT vive en una cookie httpOnly y nunca llega al navegador.
// Solo reenvía a API_INTERNAL_URL; la URL de destino se construye con la ruta y la query, nada más.
import { randomUUID } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { borrarSesion, fijarSesion, fijarTienda, leerTienda, leerToken, borrarTienda } from "@/lib/sesion/cookies"
import { CODIGO_CONEXION, MENSAJE_CONEXION, respuestaError } from "@/lib/sesion/respuestas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TIMEOUT_MS = 15_000
const RUTA_LOGIN = "auth/login"
const CABECERAS_PERMITIDAS = ["content-type", "accept", "idempotency-key", "x-carrito-token"] as const

type Contexto = { params: Promise<{ ruta: string[] }> }

const segmentoValido = (s: string) => s !== "" && s !== "." && s !== ".." && !/[/\\%]/.test(s)

function urlDestino(ruta: string[], search: string): URL | null {
  const base = (process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")
  const url = new URL(`/api/v1/${ruta.join("/")}`, base)
  url.search = search
  return url
}

async function reenviar(request: NextRequest, ctx: Contexto): Promise<NextResponse> {
  const { ruta } = await ctx.params
  const idCorrelacion = request.headers.get("x-correlacion-id") ?? randomUUID()

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
  cabeceras.set("X-Correlacion-Id", idCorrelacion)

  const esLectura = request.method === "GET" || request.method === "HEAD"
  const cuerpo = esLectura ? undefined : await request.arrayBuffer()

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

  const rutaTexto = ruta.join("/")
  const esLogin = rutaTexto === RUTA_LOGIN && request.method === "POST"

  if (esLogin && respuestaApi.status === 200) {
    return sesionDesdeLogin(respuesta, bytes, idCorrelacion)
  }
  if (respuestaApi.status === 401 && token) {
    borrarSesion(respuesta)
  }
  return respuesta
}

// En el login la API devuelve el token en el cuerpo: se guarda en cookie y se quita antes de responder.
function sesionDesdeLogin(respuesta: NextResponse, bytes: ArrayBuffer, idCorrelacion: string): NextResponse {
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
  return salida
}

export const GET = reenviar
export const POST = reenviar
export const PUT = reenviar
export const PATCH = reenviar
export const DELETE = reenviar
