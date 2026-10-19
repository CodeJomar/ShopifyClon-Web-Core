"use client"

import * as React from "react"

import { toastResponse } from "@/shared/utils/toast-response"

import { actualizarCategoria, crearCategoria, eliminarCategoria, reordenarCategorias } from "../actions/menu.actions"
import { FILTRO_TODOS, type FiltroCategoria } from "../schema"

/** Crear, renombrar, ordenar y eliminar categorías. */
export function useAccionesCategorias(refrescar: () => void, setCategoria: (categoria: FiltroCategoria) => void) {
  // Alta o renombrado de categoría
  const guardarCategoria = React.useCallback(
    async (nombre: string, id?: string): Promise<boolean> => {
      const respuesta = await toastResponse(id ? actualizarCategoria(id, { nombre }) : crearCategoria({ nombre }), {
        loading: id ? "Renombrando la categoría…" : "Creando la categoría…",
        success: id ? `Categoría renombrada a "${nombre}"` : `Categoría "${nombre}" creada`,
        error: id ? "No se pudo renombrar la categoría" : "No se pudo crear la categoría",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  const quitarCategoria = React.useCallback(
    async (id: string, nombre: string): Promise<boolean> => {
      const respuesta = await toastResponse(eliminarCategoria(id), {
        loading: "Eliminando la categoría…",
        success: `Categoría "${nombre}" eliminada`,
        error: "No se pudo eliminar la categoría",
      })
      if (respuesta.isOk()) {
        // Si se estaba filtrando por esa categoría, se vuelve a ver todo
        setCategoria(FILTRO_TODOS)
        refrescar()
      }
      return respuesta.isOk()
    },
    [refrescar, setCategoria],
  )

  /** Guarda el orden en que se muestran las categorías en el POS y en el menú (los ids, en el orden nuevo). */
  const ordenarCategorias = React.useCallback(
    async (ids: string[]): Promise<boolean> => {
      const respuesta = await toastResponse(reordenarCategorias({ ids }), {
        loading: "Guardando el orden…",
        success: "Orden de categorías actualizado",
        error: "No se pudo guardar el orden",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  return { guardarCategoria, quitarCategoria, ordenarCategorias }
}
