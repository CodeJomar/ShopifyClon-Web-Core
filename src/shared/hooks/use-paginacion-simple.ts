"use client"

import { useCallback, useMemo, useState } from "react"

interface OpcionesPaginacionSimple {
  /** Elementos por página. */
  porPagina: number
  /** Al cambiar esta clave (p. ej. los filtros) se vuelve a la primera página. */
  clave?: string
}

/**
 * Paginación por cantidad fija de elementos (catálogos, listas). Devuelve la misma forma que `usePaginacionAjustada`
 * para que `BarraPaginacion` sirva para las dos. Si cambian los filtros se reinicia; si baja el total, se ajusta a la
 * última página válida.
 */
export function usePaginacionSimple<T>(items: readonly T[], { porPagina, clave = "" }: OpcionesPaginacionSimple) {
  const [estado, setEstado] = useState({ clave, pagina: 1 })

  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina))
  const paginaSolicitada = estado.clave === clave ? estado.pagina : 1
  const pagina = Math.min(Math.max(1, paginaSolicitada), totalPaginas)

  const setPagina = useCallback((nueva: number) => setEstado({ clave, pagina: nueva }), [clave])

  const inicio = (pagina - 1) * porPagina
  const visibles = useMemo(() => items.slice(inicio, inicio + porPagina), [items, inicio, porPagina])

  return {
    visibles,
    pagina,
    totalPaginas,
    setPagina,
    desde: items.length === 0 ? 0 : inicio + 1,
    hasta: Math.min(inicio + porPagina, items.length),
    total: items.length,
  }
}
