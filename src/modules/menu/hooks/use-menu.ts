"use client"

import { useAccionesCategorias } from "./use-acciones-categorias"
import { useAccionesGrupos } from "./use-acciones-grupos"
import { useAccionesProductos } from "./use-acciones-productos"
import { useCatalogoMenu } from "./use-catalogo-menu"

/** Todo lo que necesita la pantalla del Menú: el catálogo con sus filtros y las acciones sobre productos, categorías y grupos. */
export function useMenu() {
  const catalogo = useCatalogoMenu()
  const { refrescar, setCategoria, setGrupos } = catalogo

  const productos = useAccionesProductos(refrescar)
  const categorias = useAccionesCategorias(refrescar, setCategoria)
  const grupos = useAccionesGrupos(refrescar, setGrupos)

  return { ...catalogo, ...productos, ...categorias, ...grupos }
}
