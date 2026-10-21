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
  cargando: boolean
  error: ErrorApi | null
  /** Oculta lo que el rol no puede hacer. La API vuelve a comprobar cada petición. */
  puede: Puede
  /** Permisos del rol, para depurar y para los textos de la pantalla. */
  permisos: readonly string[]
}

const PanelContext = React.createContext<PanelContextValue | null>(null)

/**
 * Carga lo que el panel necesita en cada pantalla: la tienda activa, el rol en ella y el perfil.
 * Sin tienda activa (SEG-001 / 404) manda a elegir una (`/cuenta/tiendas`).
 */
export function PanelProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [tienda, setTienda] = React.useState<TiendaActivaDto | null>(null)
  const [rol, setRol] = React.useState<string | undefined>(undefined)
  const [nombres, setNombres] = React.useState("")
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    ;(async () => {
      const activa = await tiendaActivaAction()
      if (cancelado) return
      if (!activa.ok) {
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
      if (perfil.ok) setNombres(perfil.datos.nombres)
      setCargando(false)
    })()
    return () => {
      cancelado = true
    }
  }, [router])

  const valor = React.useMemo<PanelContextValue>(
    () => ({
      tienda,
      rol,
      nombres,
      cargando,
      error,
      puede: puedeConRol(rol),
      permisos: permisosDeRol(rol),
    }),
    [tienda, rol, nombres, cargando, error],
  )

  return <PanelContext.Provider value={valor}>{children}</PanelContext.Provider>
}

export function usePanel(): PanelContextValue {
  const contexto = React.useContext(PanelContext)
  if (!contexto) throw new Error("usePanel debe usarse dentro de <PanelProvider>.")
  return contexto
}
