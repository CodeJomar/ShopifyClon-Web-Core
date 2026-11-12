"use client"

import * as React from "react"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import { misTiendasAction } from "@/modules/tienda/actions/tienda.actions"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { MiTiendaDto } from "@/dtos/tienda"

/**
 * Qué es la persona que navega, derivado de lo que tiene (decisión D1 del rediseño): todo usuario es comprador; es propietario si
 * tiene al menos una tienda; es administrador si la API lo marca. Se lee de la API real (`/cuenta/perfil` y `/cuenta/tiendas`);
 * el campo `acceso` (B2) manda sobre lo derivado de las tiendas.
 */
export type Acceso =
  | { estado: "cargando" }
  | { estado: "anonimo" }
  | { estado: "autenticado"; nombres: string; apellidos: string; correo: string; esAdministrador: boolean; esPropietario: boolean; tiendas: MiTiendaDto[] }

interface ValorAcceso {
  acceso: Acceso
  /** Vuelve a leer la sesión (tras iniciar o cerrar sesión). */
  recargar: () => void
}

const Contexto = React.createContext<ValorAcceso>({ acceso: { estado: "cargando" }, recargar: () => undefined })

export function AccesoProvider({ children }: { children: React.ReactNode }) {
  const [acceso, setAcceso] = React.useState<Acceso>({ estado: "cargando" })
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    void (async () => {
      // Quien navega la zona pública puede no tener sesión: el 401 aquí significa «anónimo», no «sesión vencida».
      const perfil = await resultado(peticionApi<PerfilCuentaDto>({ method: "GET", url: "/cuenta/perfil", sinRedireccion401: true }))
      if (cancelado) return
      if (!perfil.ok) return setAcceso({ estado: "anonimo" })
      const mis = await misTiendasAction()
      if (cancelado) return
      const tiendas = mis.ok ? mis.datos : []
      setAcceso({
        estado: "autenticado",
        nombres: perfil.datos.nombres,
        apellidos: perfil.datos.apellidos,
        correo: perfil.datos.correo_electronico,
        esAdministrador: Boolean(perfil.datos.acceso?.es_administrador_plataforma ?? perfil.datos.es_administrador_plataforma),
        esPropietario: perfil.datos.acceso?.es_propietario ?? tiendas.length > 0,
        tiendas,
      })
    })()
    return () => {
      cancelado = true
    }
  }, [version])

  const valor = React.useMemo(() => ({ acceso, recargar: () => setVersion((v) => v + 1) }), [acceso])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAcceso(): ValorAcceso {
  return React.useContext(Contexto)
}

/** A dónde llevar a la persona al terminar de iniciar sesión, según lo que sea. */
export function destinoSegunPerfil(opts: { esAdministrador: boolean; tiendas: number }): string {
  if (opts.esAdministrador) return "/plataforma"
  if (opts.tiendas > 0) return "/propietario"
  return "/mercado"
}
