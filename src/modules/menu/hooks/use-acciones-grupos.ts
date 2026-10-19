"use client"

import * as React from "react"

import { toastResponse } from "@/shared/utils/toast-response"

import {
  actualizarGrupo,
  actualizarOpcion,
  cambiarDisponibilidadOpcion,
  crearGrupo,
  crearOpcion,
  eliminarGrupo,
  eliminarOpcion,
} from "../actions/menu.actions"
import { deltaDesdeTexto, type GrupoFormValues, type GrupoMenu, type OpcionFormValues } from "../schema"

/** Grupos de personalización (leche, endulzante…) y sus opciones: crear, editar, agotar y eliminar. */
export function useAccionesGrupos(refrescar: () => void, setGrupos: React.Dispatch<React.SetStateAction<GrupoMenu[]>>) {
  // Reemplaza un grupo en la lista local con el que devuelve la API y vuelve a leer el catálogo (los productos
  // incluyen sus grupos)
  const aplicarGrupo = React.useCallback(
    (grupo: GrupoMenu) => {
      setGrupos((prev) =>
        prev.some((g) => g.id_grupo === grupo.id_grupo) ? prev.map((g) => (g.id_grupo === grupo.id_grupo ? grupo : g)) : [...prev, grupo],
      )
      refrescar()
    },
    [refrescar, setGrupos],
  )

  const guardarGrupo = React.useCallback(
    async (values: GrupoFormValues, id?: string): Promise<boolean> => {
      const payload = {
        nombre: values.nombre.trim(),
        seleccion_minima: Number(values.seleccionMinima),
        seleccion_maxima: Number(values.seleccionMaxima),
      }
      const respuesta = await toastResponse(id ? actualizarGrupo(id, payload) : crearGrupo(payload), {
        loading: id ? "Guardando el grupo…" : "Creando el grupo…",
        success: id ? `Grupo "${payload.nombre}" actualizado` : `Grupo "${payload.nombre}" creado`,
        error: id ? "No se pudo guardar el grupo" : "No se pudo crear el grupo",
      })
      if (respuesta.isOk()) aplicarGrupo(respuesta.data)
      return respuesta.isOk()
    },
    [aplicarGrupo],
  )

  const quitarGrupo = React.useCallback(
    async (grupo: GrupoMenu): Promise<boolean> => {
      const respuesta = await toastResponse(eliminarGrupo(grupo.id_grupo), {
        loading: "Eliminando el grupo…",
        success: `Grupo "${grupo.nombre}" eliminado`,
        error: "No se pudo eliminar el grupo",
      })
      if (respuesta.isOk()) {
        setGrupos((prev) => prev.filter((g) => g.id_grupo !== grupo.id_grupo))
        refrescar()
      }
      return respuesta.isOk()
    },
    [refrescar, setGrupos],
  )

  const guardarOpcion = React.useCallback(
    async (idGrupo: string, values: OpcionFormValues, idOpcion?: string): Promise<boolean> => {
      const payload = { nombre: values.nombre.trim(), price_delta: deltaDesdeTexto(values.precioDelta) }
      const respuesta = await toastResponse(idOpcion ? actualizarOpcion(idOpcion, payload) : crearOpcion(idGrupo, payload), {
        loading: idOpcion ? "Guardando la opción…" : "Agregando la opción…",
        success: idOpcion ? `Opción "${payload.nombre}" actualizada` : `Opción "${payload.nombre}" agregada`,
        error: idOpcion ? "No se pudo guardar la opción" : "No se pudo agregar la opción",
      })
      if (respuesta.isOk()) aplicarGrupo(respuesta.data)
      return respuesta.isOk()
    },
    [aplicarGrupo],
  )

  const alternarOpcion = React.useCallback(
    async (idOpcion: string, nombre: string, disponible: boolean): Promise<boolean> => {
      const respuesta = await toastResponse(cambiarDisponibilidadOpcion(idOpcion, disponible), {
        loading: "Actualizando la opción…",
        success: disponible ? `"${nombre}" disponible` : `"${nombre}" agotada`,
        error: "No se pudo actualizar la opción",
      })
      if (respuesta.isOk()) aplicarGrupo(respuesta.data)
      return respuesta.isOk()
    },
    [aplicarGrupo],
  )

  const quitarOpcion = React.useCallback(
    async (idOpcion: string, nombre: string): Promise<boolean> => {
      const respuesta = await toastResponse(eliminarOpcion(idOpcion), {
        loading: "Eliminando la opción…",
        success: `Opción "${nombre}" eliminada`,
        error: "No se pudo eliminar la opción",
      })
      if (respuesta.isOk()) aplicarGrupo(respuesta.data)
      return respuesta.isOk()
    },
    [aplicarGrupo],
  )

  return { guardarGrupo, quitarGrupo, guardarOpcion, alternarOpcion, quitarOpcion }
}
