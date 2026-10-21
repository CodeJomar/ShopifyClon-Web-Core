"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { perfilAction } from "@/modules/auth"
import { misTiendasAction, tiendaActivaAction } from "@/modules/tienda/actions/tienda.actions"
import { permisosDeRol, puedeConRol, type Puede } from "@/shared/constants/permisos"
import type { TiendaActivaDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"

export interface PanelContextValue {
  /** Tienda activa (GET /panel/tienda). null mientras carga o si falló. */
  tienda: TiendaActivaDto | null
  /** Rol de la persona en la tienda activa (GET /cuenta/tiendas). Sin rol, no ve ninguna sección. */
  rol: string | undefined
  /** Nombres de la persona (perfil). */
  nombres: string
  /** Apellidos de la persona (perfil). */
  apellidos: string
  /** Indica si la persona es administradora global de la plataforma (acceso a /plataforma). */
  esAdministradorPlataforma: boolean
  cargando: boolean
  error: ErrorApi | null
  /** Oculta lo que el rol no puede hacer. La API vuelve a comprobar cada petición. */
  puede: Puede
  /** Permisos del rol, para depurar y para los textos de la pantalla. */
  permisos: readonly string[]
  /** Vuelve a consultar la tienda activa para actualizar su estado (p. ej. tras activar, desactivar o pagar). */
  recargar: () => Promise<void>
}

const PanelContext = React.createContext<PanelContextValue | null>(null)

/**
 * Carga lo que el panel necesita en cada pantalla: la tienda activa, el rol en ella y el perfil.
 * Con `exigirTienda` (el panel), sin tienda activa (SEG-001 / 404) manda a elegir una (`/cuenta/tiendas`).
 * Sin `exigirTienda` (la cuenta o plataforma) la falta de tienda activa es normal: no redirige y solo carga el perfil.
 */
export function PanelProvider({ children, exigirTienda = true }: { children: React.ReactNode; exigirTienda?: boolean }) {
  const router = useRouter()
  const [tienda, setTienda] = React.useState<TiendaActivaDto | null>(null)
  const [rol, setRol] = React.useState<string | undefined>(undefined)
  const [nombres, setNombres] = React.useState("")
  const [apellidos, setApellidos] = React.useState("")
  const [esAdministradorPlataforma, setEsAdministradorPlataforma] = React.useState(false)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const recargar = React.useCallback(async () => {
    const activa = await tiendaActivaAction()
    if (activa.ok) {
      setTienda(activa.datos)
    }
  }, [])

  React.useEffect(() => {
    let cancelado = false
    ;(async () => {
      const activa = await tiendaActivaAction()
      if (cancelado) return
      if (!activa.ok) {
        if (!exigirTienda) {
          const perfil = await perfilAction()
          if (cancelado) return
          if (perfil.ok) {
            setNombres(perfil.datos.nombres)
            setApellidos(perfil.datos.apellidos)
            setEsAdministradorPlataforma(Boolean(perfil.datos.es_administrador_plataforma))
          }
          setCargando(false)
          return
        }
        if (activa.error.codigo === "SEG-001" || activa.error.estado === 404) {
          router.replace("/cuenta/tiendas")
          return
        }
        setError(activa.error)
        setCargando(false)
        return
      }
      const [mis, perfil] = await Promise.all([misTiendasAction(), perfilAction()])
      if (cancelado) return
      setTienda(activa.datos)
      if (mis.ok) setRol(mis.datos.find((t) => t.tienda_id === activa.datos.id)?.rol)
      if (perfil.ok) {
        setNombres(perfil.datos.nombres)
        setApellidos(perfil.datos.apellidos)
        setEsAdministradorPlataforma(Boolean(perfil.datos.es_administrador_plataforma))
      }
      setCargando(false)
    })()
    return () => {
      cancelado = true
    }
  }, [router, exigirTienda])

  const valor = React.useMemo<PanelContextValue>(
    () => ({
      tienda,
      rol,
      nombres,
      apellidos,
      esAdministradorPlataforma,
      cargando,
      error,
      puede: puedeConRol(rol),
      permisos: permisosDeRol(rol),
      recargar,
    }),
    [tienda, rol, nombres, apellidos, esAdministradorPlataforma, cargando, error, recargar],
  )

  return <PanelContext.Provider value={valor}>{children}</PanelContext.Provider>
}

export function usePanel(): PanelContextValue {
  const contexto = React.useContext(PanelContext)
  if (!contexto) throw new Error("usePanel debe usarse dentro de <PanelProvider>.")
  return contexto
}
