"use client"

import * as React from "react"

import { conectarTiempoReal } from "@/lib/realtime/kds-socket"
import { normalizarTexto } from "@/shared/utils/formatters"
import { toastResponse } from "@/shared/utils/toast-response"

import { cambiarDisponibilidadProducto, getCatalogoMenu, getGrupos } from "../actions/menu.actions"
import {
  FILTRO_TODOS,
  type CatalogoMenu,
  type FiltroCategoria,
  type FiltroDisponibilidad,
  type GrupoMenu,
  type ProductoMenu,
  type ResumenMenu,
} from "../schema"

/**
 * Catálogo del menú (categorías, productos y grupos de personalización), sus filtros y el control rápido de
 * disponibilidad. Se mantiene al día solo: recarga cuando otra pantalla cambia el menú (evento en tiempo real).
 */
export function useCatalogoMenu() {
  const [catalogo, setCatalogo] = React.useState<CatalogoMenu | null>(null)
  const [grupos, setGrupos] = React.useState<GrupoMenu[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const [busqueda, setBusqueda] = React.useState("")
  const [categoria, setCategoria] = React.useState<FiltroCategoria>(FILTRO_TODOS)
  const [disponibilidad, setDisponibilidad] = React.useState<FiltroDisponibilidad>("todos")

  // Productos con un cambio de disponibilidad en curso
  const [pendientes, setPendientes] = React.useState<ReadonlySet<string>>(new Set())

  React.useEffect(() => {
    let vigente = true

    Promise.all([getCatalogoMenu(), getGrupos()])
      .then(([respuestaCatalogo, respuestaGrupos]) => {
        if (!vigente) return
        if (!respuestaCatalogo.isOk()) {
          setError(respuestaCatalogo.getMessage())
          return
        }
        const categorias = respuestaCatalogo.data ?? []
        setCatalogo({ categorias, productos: categorias.flatMap((c) => c.productos) })
        setGrupos(respuestaGrupos.isOk() ? (respuestaGrupos.data ?? []) : [])
        setError(null)
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar el catálogo del menú.")
      })
      .finally(() => {
        if (vigente) setIsLoading(false)
      })

    return () => {
      vigente = false
    }
  }, [reloadKey])

  // Recarga mostrando el estado de carga (botón "Actualizar")
  const recargar = React.useCallback(() => {
    setIsLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  // Recarga sin parpadeo, tras guardar o eliminar algo
  const refrescar = React.useCallback(() => setReloadKey((k) => k + 1), [])

  // Si otra persona (u otra pestaña) cambia el menú, esta pantalla se actualiza sola
  React.useEffect(() => conectarTiempoReal({ onCatalogoActualizado: refrescar }) ?? undefined, [refrescar])

  // Reemplaza un producto en el catálogo local (cambio inmediato mientras la API responde)
  const aplicarProducto = React.useCallback((producto: ProductoMenu) => {
    setCatalogo((prev) =>
      prev ? { ...prev, productos: prev.productos.map((p) => (p.id_producto === producto.id_producto ? producto : p)) } : prev,
    )
  }, [])

  const productosFiltrados = React.useMemo(() => {
    if (!catalogo) return []
    const termino = normalizarTexto(busqueda)

    return catalogo.productos.filter((p) => {
      const coincideCategoria = categoria === FILTRO_TODOS || p.id_categoria === categoria
      const coincideDisponibilidad = disponibilidad === "todos" || (disponibilidad === "disponibles" ? p.disponible : !p.disponible)
      const coincideBusqueda =
        !termino || normalizarTexto(p.nombre).includes(termino) || normalizarTexto(p.descripcion ?? "").includes(termino)
      return coincideCategoria && coincideDisponibilidad && coincideBusqueda
    })
  }, [catalogo, busqueda, categoria, disponibilidad])

  const resumen = React.useMemo<ResumenMenu>(() => {
    const productos = catalogo?.productos ?? []
    const disponibles = productos.filter((p) => p.disponible).length
    return { total: productos.length, disponibles, agotados: productos.length - disponibles }
  }, [catalogo])

  const limpiarFiltros = React.useCallback(() => {
    setBusqueda("")
    setCategoria(FILTRO_TODOS)
    setDisponibilidad("todos")
  }, [])

  /**
   * Cambia la disponibilidad con un solo toque.
   * La interfaz se actualiza al instante y se revierte si el guardado falla.
   */
  const toggleDisponibilidad = React.useCallback(
    async (producto: ProductoMenu) => {
      if (pendientes.has(producto.id_producto)) return
      const disponible = !producto.disponible

      aplicarProducto({ ...producto, disponible })
      setPendientes((prev) => new Set(prev).add(producto.id_producto))

      const respuesta = await toastResponse(cambiarDisponibilidadProducto(producto.id_producto, disponible), {
        loading: "Actualizando disponibilidad…",
        success: disponible ? `"${producto.nombre}" vuelve a estar disponible en el POS` : `"${producto.nombre}" marcado como Agotado`,
        successDescription: disponible ? undefined : "Ya no se puede seleccionar en el POS.",
        error: `No se pudo actualizar "${producto.nombre}"`,
      })
      if (!respuesta.isOk()) aplicarProducto(producto)

      setPendientes((prev) => {
        const siguiente = new Set(prev)
        siguiente.delete(producto.id_producto)
        return siguiente
      })
    },
    [pendientes, aplicarProducto],
  )

  return {
    catalogo,
    grupos,
    setGrupos,
    productosFiltrados,
    resumen,
    isLoading,
    error,
    recargar,
    refrescar,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    disponibilidad,
    setDisponibilidad,
    limpiarFiltros,
    pendientes,
    toggleDisponibilidad,
  }
}
