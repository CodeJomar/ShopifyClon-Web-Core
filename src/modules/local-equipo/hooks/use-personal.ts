"use client"

import * as React from "react"

import { normalizarTexto } from "@/shared/utils/formatters"
import { toastResponse } from "@/shared/utils/toast-response"

import {
  actualizarEmpleado,
  crearEmpleado,
  darDeBajaEmpleado,
  getCargos,
  getEmpleados,
  reenviarActivacion,
} from "../actions/local-equipo.actions"
import type {
  Cargo,
  Empleado,
  EmpleadoFormValues,
  EstadoEmpleado,
  FiltroEstadoEmpleado,
  FiltroRolEmpleado,
} from "../schema"

// La API entrega como máximo 100 empleados por página: se leen todas las páginas
async function getTodosLosEmpleados(): Promise<{ empleados: Empleado[]; error: string | null }> {
  const primera = await getEmpleados(1)
  if (!primera.isOk()) return { empleados: [], error: primera.getMessage() }
  const empleados = [...primera.data]
  for (let pagina = 2; pagina <= primera.meta.total_paginas; pagina++) {
    const siguiente = await getEmpleados(pagina)
    if (!siguiente.isOk()) return { empleados, error: siguiente.getMessage() }
    empleados.push(...siguiente.data)
  }
  return { empleados, error: null }
}

/* -------------------------------------------------------------------------- */
/*                 Gestión de personal y asignación de cargos                 */
/* -------------------------------------------------------------------------- */

export function usePersonal() {
  const [empleados, setEmpleados] = React.useState<Empleado[]>([])
  const [cargos, setCargos] = React.useState<Cargo[]>([])
  const [cargado, setCargado] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const [busqueda, setBusqueda] = React.useState("")
  const [rol, setRol] = React.useState<FiltroRolEmpleado>("todos")
  const [estado, setEstado] = React.useState<FiltroEstadoEmpleado>("todos")

  React.useEffect(() => {
    let vigente = true

    Promise.all([getTodosLosEmpleados(), getCargos()])
      .then(([lista, respuestaCargos]) => {
        if (!vigente) return
        if (lista.error) {
          setError(lista.error)
          return
        }
        setEmpleados(lista.empleados)
        setCargos(respuestaCargos.isOk() ? (respuestaCargos.data ?? []) : [])
        setError(null)
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar la información del equipo.")
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

  const empleadosFiltrados = React.useMemo(() => {
    const termino = normalizarTexto(busqueda)

    return empleados
      .filter((e) => {
        const coincideRol = rol === "todos" || e.id_rol === rol
        const coincideEstado = estado === "todos" || e.estado === estado
        const coincideBusqueda =
          !termino ||
          normalizarTexto(e.nombre).includes(termino) ||
          normalizarTexto(e.email).includes(termino) ||
          normalizarTexto(e.rol_nombre ?? "").includes(termino)
        return coincideRol && coincideEstado && coincideBusqueda
      })
      .sort((a, b) => {
        // El Dueño primero; luego los de baja al final y orden alfabético
        if (a.tipo_cuenta !== b.tipo_cuenta) return a.tipo_cuenta === "OWNER" ? -1 : 1
        if ((a.estado === "inactivo") !== (b.estado === "inactivo")) return a.estado === "inactivo" ? 1 : -1
        return a.nombre.localeCompare(b.nombre, "es")
      })
  }, [empleados, busqueda, rol, estado])

  const conteoPorEstado = React.useMemo(() => {
    const mapa = new Map<EstadoEmpleado, number>()
    for (const e of empleados) mapa.set(e.estado, (mapa.get(e.estado) ?? 0) + 1)
    return mapa
  }, [empleados])

  /** Registra un empleado (la API le envía el correo de activación) o actualiza sus datos y su cargo. */
  const guardarEmpleado = React.useCallback(
    async (values: EmpleadoFormValues, empleado?: Empleado): Promise<boolean> => {
      // La ficha solo envía lo que se llenó (la API valida el formato). La fecha de ingreso la fija la API al registrar.
      const ficha = {
        ...(values.dni ? { dni: values.dni } : {}),
        ...(values.telefono ? { telefono: values.telefono } : {}),
      }
      const base = { nombre: values.nombre.trim(), email: values.email, id_rol: values.idRol, ...ficha }
      const respuesta = await toastResponse(
        empleado ? actualizarEmpleado(empleado.id_usuario, base) : crearEmpleado(base),
        {
          loading: empleado ? "Guardando los cambios…" : "Registrando al empleado…",
          success: empleado
            ? `Datos de ${base.nombre} actualizados`
            : `${base.nombre} registrado`,
          successDescription: empleado ? undefined : "Su cuenta queda pendiente de activación por correo.",
          error: empleado ? "No se pudo guardar el empleado" : "No se pudo registrar al empleado",
        },
      )
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  /** Cambia el estado de la cuenta: reactivar, suspender o volver a activar tras una baja. */
  const cambiarEstado = React.useCallback(
    async (empleado: Empleado, nuevo: "activo" | "suspendido"): Promise<boolean> => {
      const respuesta = await toastResponse(actualizarEmpleado(empleado.id_usuario, { estado: nuevo }), {
        loading: nuevo === "activo" ? "Reactivando…" : "Suspendiendo…",
        success: nuevo === "activo" ? `${empleado.nombre} fue reactivado` : `${empleado.nombre} fue suspendido`,
        error: "No se pudo cambiar el estado",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  const darDeBaja = React.useCallback(
    async (empleado: Empleado, motivo?: string): Promise<boolean> => {
      const respuesta = await toastResponse(darDeBajaEmpleado(empleado.id_usuario, { motivo }), {
        loading: "Dando de baja…",
        success: `${empleado.nombre} fue dado de baja`,
        error: "No se pudo dar de baja al empleado",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  const reenviar = React.useCallback(async (empleado: Empleado): Promise<boolean> => {
    const respuesta = await toastResponse(reenviarActivacion(empleado.id_usuario), {
      loading: "Enviando el correo de activación…",
      success: `Correo de activación enviado a ${empleado.email}`,
      error: "No se pudo enviar el correo",
    })
    return respuesta.isOk()
  }, [])

  const limpiarFiltros = React.useCallback(() => {
    setBusqueda("")
    setRol("todos")
    setEstado("todos")
  }, [])

  return {
    cargos,
    empleados,
    empleadosFiltrados,
    conteoPorEstado,
    cargado,
    error,
    recargar,
    busqueda,
    setBusqueda,
    rol,
    setRol,
    estado,
    setEstado,
    limpiarFiltros,
    guardarEmpleado,
    cambiarEstado,
    darDeBaja,
    reenviar,
  }
}
