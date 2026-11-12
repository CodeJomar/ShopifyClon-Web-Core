"use client"

import * as React from "react"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ErrorApi } from "@/lib/api/error-api"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"

type Parametros = Record<string, string | number | undefined>

/**
 * Lista paginada de la administración de plataforma (B8): vuelve a consultar cuando cambian los filtros o la página, y deja
 * `recargar` para después de una acción. La API pagina desde 0 y de 20 en 20; aquí la página va desde 1.
 */
export function useListaAdmin<T>(ruta: string, filtros: Parametros) {
  const [pagina, setPagina] = React.useState(1)
  const [datos, setDatos] = React.useState<Paginado<T> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [version, setVersion] = React.useState(0)
  const clave = JSON.stringify(filtros)

  // Un cambio de filtros vuelve a la primera página.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicio de la paginación al cambiar filtros
    setPagina(1)
  }, [clave])

  React.useEffect(() => {
    let cancelado = false
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ""))
    void resultado(peticionApi<Paginado<T>>({ method: "GET", url: ruta, params: { ...params, pagina: pagina - 1 } })).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setDatos(res.datos)
        setError(null)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
    // `clave` representa a `filtros`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta, clave, pagina, version])

  return { datos, error, pagina, setPagina, recargar: () => setVersion((v) => v + 1), cargando: datos === null && error === null }
}
