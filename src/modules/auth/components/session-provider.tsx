"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { Spinner } from "@/shared/components/ui/spinner"
import type { SesionUsuarioDto } from "@/dtos/auth"
import { logoutAction, perfilAction } from "../actions/auth.actions"
import { EVENTO_SESION_REEMPLAZADA, sesionReemplazada } from "@/lib/api/sesion-reemplazada"
import { toast } from "@/shared/components/ui/toast"
import { useAvisosSesion } from "../hooks/use-avisos-sesion"
import { useInactividad } from "../hooks/use-inactividad"

const SessionContext = React.createContext<SesionUsuarioDto | null>(null)
/** Cada cuánto se vuelve a consultar la sesión mientras la pestaña está visible (avisos de la cuenta y sesión reemplazada). */
const SONDEO_MS = 5_000

const RefrescarSesionContext = React.createContext<(() => Promise<void>) | null>(null)

/** Usuario autenticado del workspace. Solo disponible dentro de <SessionProvider>. */
export function useSession(): SesionUsuarioDto {
  const usuario = React.useContext(SessionContext)
  if (!usuario) throw new Error("useSession debe usarse dentro de <SessionProvider>.")
  return usuario
}

/** Vuelve a leer el usuario de la API (por ejemplo, tras cambiar el nombre desde el perfil). */
export function useRefrescarSesion(): () => Promise<void> {
  const refrescar = React.useContext(RefrescarSesionContext)
  if (!refrescar) throw new Error("useRefrescarSesion debe usarse dentro de <SessionProvider>.")
  return refrescar
}

/**
 * Confirma la sesión real con la API (/auth/me) antes de mostrar el workspace y la vuelve a confirmar cada vez que
 * el usuario regresa a la pestaña: así un cambio de cargo o de permisos hecho por el propietario se refleja sin
 * tener que cerrar sesión. El cliente HTTP renueva el access token si venció; si la sesión no se puede recuperar,
 * vuelve al login. La autorización sigue en NestJS.
 *
 * Mientras la pestaña está visible repite la consulta cada 10 s (sin contar como actividad): así un aviso de la cuenta
 * (un intento de inicio de sesión ajeno) llega aunque la persona no esté tocando la pantalla, y una sesión reemplazada
 * desde otro navegador vuelve al login enseguida. Un fallo de red no cierra la sesión; solo un 401 o 403.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = React.useState<SesionUsuarioDto | null>(null)
  const avisar = useAvisosSesion()

  // Otra persona inició sesión con esta cuenta en otro navegador y continuó: esta sesión se cierra de inmediato y el
  // login explica con un toast lo que pasó (?motivo=reemplazada).
  React.useEffect(() => {
    const alReemplazar = () => {
      void logoutAction().finally(() => window.location.replace("/login?motivo=reemplazada"))
    }
    window.addEventListener(EVENTO_SESION_REEMPLAZADA, alReemplazar)
    return () => window.removeEventListener(EVENTO_SESION_REEMPLAZADA, alReemplazar)
  }, [])

  // Huella del perfil mostrado (sin los avisos): el sondeo solo vuelve a pintar el workspace si algo cambió.
  const huellaPerfil = React.useRef("")
  const aplicar = React.useCallback((datos: SesionUsuarioDto) => {
    huellaPerfil.current = JSON.stringify({ ...datos, avisos: [] })
    setUsuario(datos)
  }, [])

  // La ruta actual se lee al fallar, sin volver a pedir la sesión en cada navegación.
  const rutaActual = React.useRef(pathname)
  React.useEffect(() => {
    rutaActual.current = pathname
  }, [pathname])

  // Vuelve a pedir la sesión: la usa el efecto de abajo y, desde el perfil, quien edita sus datos
  const refrescar = React.useCallback(
    () =>
      perfilAction().then((res) => {
        if (res.isOk()) {
          aplicar(res.data)
          avisar(res.data.avisos)
        } else if (!sesionReemplazada()) router.replace(`/login?siguiente=${encodeURIComponent(rutaActual.current)}`)
      }),
    [router, avisar, aplicar],
  )

  React.useEffect(() => {
    let cancelado = false

    const confirmarSesion = () =>
      perfilAction().then((res) => {
        // Los avisos ya se entregaron (la API los borra al enviarlos): se muestran aunque esta consulta haya quedado
        // obsoleta (p. ej., el montaje doble de React en desarrollo), para no perderlos.
        if (res.isOk()) avisar(res.data.avisos)
        if (cancelado) return
        if (res.isOk()) aplicar(res.data)
        else if (!sesionReemplazada()) router.replace(`/login?siguiente=${encodeURIComponent(rutaActual.current)}`)
      })

    // Sondeo periódico: entrega avisos y detecta que la sesión ya no existe, sin repintar si el perfil no cambió.
    let sondeando = false
    const sondear = () => {
      if (document.visibilityState !== "visible" || sondeando) return
      sondeando = true
      void perfilAction()
        .then((res) => {
          if (res.isOk()) avisar(res.data.avisos)
          if (cancelado) return
          if (res.isOk()) {
            if (JSON.stringify({ ...res.data, avisos: [] }) !== huellaPerfil.current) aplicar(res.data)
          } else if ((res.httpStatusCode === 401 || res.httpStatusCode === 403) && !sesionReemplazada()) {
            router.replace(`/login?siguiente=${encodeURIComponent(rutaActual.current)}`)
          }
        })
        .finally(() => {
          sondeando = false
        })
    }

    const alVolver = () => {
      if (document.visibilityState === "visible") void confirmarSesion()
    }

    void confirmarSesion()
    document.addEventListener("visibilitychange", alVolver)
    const intervalo = setInterval(sondear, SONDEO_MS)
    return () => {
      cancelado = true
      clearInterval(intervalo)
      document.removeEventListener("visibilitychange", alVolver)
    }
  }, [router, avisar, aplicar])

  // Sin actividad del usuario durante el tiempo que fija la API, la sesión se cierra y se vuelve al login.
  useInactividad(usuario?.inactividad_segundos, {
    alExpirar: () => {
      void logoutAction().finally(() => router.replace("/login?motivo=inactividad"))
    },
    alAvisar: avisar,
    // Faltan 10 segundos: se avisa y el aviso se retira solo si la persona vuelve a actuar.
    alPorExpirar: () => {
      const id = toast.add({
        type: "warning",
        title: "Tu sesión está por cerrarse",
        description: "Por inactividad se cerrará en unos segundos. Haz clic o toca la pantalla para mantenerla abierta.",
        timeout: 11000,
      })
      return () => toast.close(id)
    },
  })

  if (!usuario) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#EDE5E6]/40" role="status" aria-label="Verificando sesión">
        <Spinner />
      </div>
    )
  }

  return (
    <SessionContext.Provider value={usuario}>
      <RefrescarSesionContext.Provider value={refrescar}>{children}</RefrescarSesionContext.Provider>
    </SessionContext.Provider>
  )
}
