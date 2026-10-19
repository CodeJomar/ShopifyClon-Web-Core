"use client"

import * as React from "react"
import type { CategoriaCatalogoDto } from "@/dtos/menu"
import { conectarTiempoReal } from "@/lib/realtime/kds-socket"
import { normalizarTexto as normalizar } from "@/shared/utils/formatters"
import { toastResponse } from "@/shared/utils/toast-response"
import { getCatalogoPos, getMesasPos, liberarMesa } from "../actions/pos.actions"
import { FILTRO_TODOS, SONDEO_POS_MS, type CategoriaPos, type FiltroCategoria, type MesaPos, type ProductoCatalogo } from "../schema"

/* -------------------------------------------------------------------------- */
/*                         Catálogo y mesas (datos vivos)                      */
/* -------------------------------------------------------------------------- */

/**
 * Catálogo de productos y mapa de mesas. Se mantienen al día con eventos en tiempo real (mesas y pedidos),
 * un sondeo cada 30 s y al volver a la pestaña.
 */
export function useCatalogoPos() {
  const [categoriasApi, setCategoriasApi] = React.useState<CategoriaCatalogoDto[]>([])
  const [mesas, setMesas] = React.useState<MesaPos[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [busqueda, setBusqueda] = React.useState("")
  const [categoria, setCategoria] = React.useState<FiltroCategoria>(FILTRO_TODOS)
  const [enVivo, setEnVivo] = React.useState(false)

  const cargarCatalogo = React.useCallback(
    (silencioso = false) =>
      getCatalogoPos().then((res) => {
        if (res.isOk()) {
          setCategoriasApi(res.data ?? [])
          setError(null)
        } else if (!silencioso) {
          setError(res.getMessage())
        }
      }),
    [],
  )

  const cargarMesas = React.useCallback(
    (silencioso = false) =>
      getMesasPos().then((res) => {
        if (res.isOk()) setMesas(res.data ?? [])
        else if (!silencioso) setError(res.getMessage())
      }),
    [],
  )

  const cargarTodo = React.useCallback(
    (silencioso = false) => Promise.all([cargarCatalogo(silencioso), cargarMesas(silencioso)]).then(() => setIsLoading(false)),
    [cargarCatalogo, cargarMesas],
  )

  const recargar = React.useCallback(() => {
    setIsLoading(true)
    void cargarTodo()
  }, [cargarTodo])

  React.useEffect(() => {
    void cargarTodo()
    const sondeo = setInterval(() => void cargarTodo(true), SONDEO_POS_MS)
    const alVolver = () => {
      if (document.visibilityState === "visible") void cargarTodo(true)
    }
    document.addEventListener("visibilitychange", alVolver)
    return () => {
      clearInterval(sondeo)
      document.removeEventListener("visibilitychange", alVolver)
    }
  }, [cargarTodo])

  // Tiempo real: el estado de una mesa cambia al instante y los pedidos refrescan el mapa (pedido en curso y total).
  React.useEffect(() => {
    const cerrar = conectarTiempoReal({
      onMesaEstado: ({ id_mesa, estado }) => {
        setMesas((prev) => prev.map((m) => (m.id_mesa === id_mesa ? { ...m, estado } : m)))
        void cargarMesas(true)
      },
      onNuevaComanda: () => void cargarMesas(true),
      onComandaEstado: () => void cargarMesas(true),
      onPagoActualizado: () => void cargarMesas(true),
      // Otra pantalla cambió el menú (precio, disponibilidad, categorías): el catálogo se vuelve a leer
      onCatalogoActualizado: () => void cargarCatalogo(true),
      onConexion: setEnVivo,
    })
    return () => {
      cerrar?.()
    }
  }, [cargarMesas, cargarCatalogo])

  const categorias = React.useMemo<CategoriaPos[]>(
    () => categoriasApi.map((c) => ({ id: c.id_categoria, nombre: c.nombre })),
    [categoriasApi],
  )

  const productos = React.useMemo<ProductoCatalogo[]>(
    () => categoriasApi.flatMap((c) => c.productos.map((p) => ({ ...p, categoria_nombre: c.nombre }))),
    [categoriasApi],
  )

  const productosFiltrados = React.useMemo(() => {
    const termino = normalizar(busqueda)
    return productos.filter((p) => {
      const coincideCategoria = categoria === FILTRO_TODOS || p.id_categoria === categoria
      const coincideBusqueda =
        !termino || normalizar(p.nombre).includes(termino) || normalizar(p.descripcion ?? "").includes(termino)
      return coincideCategoria && coincideBusqueda
    })
  }, [productos, busqueda, categoria])

  // Si la categoría filtrada desaparece (la borraron desde el Menú), se vuelve a "todos".
  const categoriaActiva =
    categoria === FILTRO_TODOS || categorias.some((c) => c.id === categoria) ? categoria : FILTRO_TODOS

  /** Marca la mesa como libre (la limpieza terminó). Devuelve true si la API lo aceptó. */
  const marcarMesaLibre = React.useCallback(
    async (idMesa: string): Promise<boolean> => {
      const res = await toastResponse(liberarMesa(idMesa), {
        loading: "Liberando mesa...",
        success: "Mesa libre",
        error: "No se pudo liberar la mesa",
      })
      if (res.isOk()) setMesas((prev) => prev.map((m) => (m.id_mesa === idMesa ? { ...m, estado: "libre" } : m)))
      else void cargarMesas(true)
      return res.isOk()
    },
    [cargarMesas],
  )

  return {
    categorias,
    productos,
    productosFiltrados,
    mesas,
    busqueda,
    setBusqueda,
    categoria: categoriaActiva,
    setCategoria,
    isLoading,
    error,
    enVivo,
    recargar,
    recargarMesas: cargarMesas,
    marcarMesaLibre,
  }
}
