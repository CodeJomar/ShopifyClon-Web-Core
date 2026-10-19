"use client"

import * as React from "react"

import type { BaseResponse } from "@/dtos/core/baseResponse.dto"
import { toastResponse } from "@/shared/utils/toast-response"

import {
  actualizarRol,
  crearRol,
  eliminarRol,
  getCatalogoPermisos,
  getRol,
  getRoles,
  reemplazarPermisosRol,
} from "../actions/local-equipo.actions"
import { permisoDesdeClave, type ModuloCatalogo, type Rol, type RolDetalle, type RolFormValues } from "../schema"

/* -------------------------------------------------------------------------- */
/*                       Cargos (roles) y sus permisos                        */
/* -------------------------------------------------------------------------- */

export function useRoles() {
  const [roles, setRoles] = React.useState<Rol[]>([])
  const [catalogo, setCatalogo] = React.useState<ModuloCatalogo[]>([])
  const [cargado, setCargado] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    let vigente = true

    Promise.all([getRoles(), getCatalogoPermisos()])
      .then(([respuestaRoles, respuestaCatalogo]) => {
        if (!vigente) return
        if (!respuestaRoles.isOk()) {
          setError(respuestaRoles.getMessage())
          return
        }
        setRoles(respuestaRoles.data ?? [])
        setCatalogo(respuestaCatalogo.isOk() ? (respuestaCatalogo.data ?? []) : [])
        setError(null)
      })
      .catch(() => {
        if (vigente) setError("No se pudieron cargar los roles.")
      })
      .finally(() => {
        if (vigente) setCargado(true)
      })

    return () => {
      vigente = false
    }
  }, [reloadKey])

  const recargar = React.useCallback(() => {
    setCargado(false)
    setReloadKey((k) => k + 1)
  }, [])

  const refrescar = React.useCallback(() => setReloadKey((k) => k + 1), [])

  /** Lee el rol con sus permisos para editarlo; devuelve null (y avisa con un toast) si no se pudo. */
  const cargarDetalle = React.useCallback(async (id: string): Promise<RolDetalle | null> => {
    const respuesta = await toastResponse(getRol(id), {
      loading: "Cargando el rol…",
      success: "Rol cargado",
      error: "No se pudo cargar el rol",
    })
    return respuesta.isOk() ? respuesta.data : null
  }, [])

  /** Crea el rol con sus permisos o actualiza nombre, descripción y permisos de uno existente. */
  const guardarRol = React.useCallback(
    async (values: RolFormValues, rol?: RolDetalle): Promise<boolean> => {
      const nombre = values.nombre.trim()
      const permisos = values.permisos.map(permisoDesdeClave)

      const operacion = (async (): Promise<BaseResponse> => {
        if (!rol) return crearRol({ nombre, descripcion: values.descripcion.trim() || undefined, permisos })
        const datos = await actualizarRol(rol.id_rol, { nombre, descripcion: values.descripcion.trim() })
        if (!datos.isOk()) return datos
        return reemplazarPermisosRol(rol.id_rol, { permisos })
      })()

      const respuesta = await toastResponse(operacion, {
        loading: rol ? "Guardando el rol…" : "Creando el rol…",
        success: rol ? `Permisos de "${nombre}" actualizados` : `Rol "${nombre}" creado`,
        error: rol ? "No se pudo guardar el rol" : "No se pudo crear el rol",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  const quitarRol = React.useCallback(
    async (rol: RolDetalle): Promise<boolean> => {
      const respuesta = await toastResponse(eliminarRol(rol.id_rol), {
        loading: "Eliminando el rol…",
        success: `Rol "${rol.nombre}" eliminado`,
        error: "No se pudo eliminar el rol",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  return { roles, catalogo, cargado, error, recargar, cargarDetalle, guardarRol, quitarRol }
}
