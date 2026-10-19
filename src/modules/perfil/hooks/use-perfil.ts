"use client"

import * as React from "react"

import { useRefrescarSesion } from "@/modules/auth"
import { toastResponse } from "@/shared/utils/toast-response"

import { actualizarPerfil, cambiarPassword } from "../actions/perfil.actions"
import type { CambiarPasswordValues, DatosPerfilValues } from "../schema"

/** Guardar los datos propios y cambiar la contraseña; ambos avisan con toast y devuelven si salió bien. */
export function usePerfil() {
  const refrescarSesion = useRefrescarSesion()

  const guardarDatos = React.useCallback(
    async ({ nombre }: DatosPerfilValues): Promise<boolean> => {
      const respuesta = await toastResponse(actualizarPerfil({ nombre }), {
        loading: "Guardando tus datos…",
        success: "Tus datos se actualizaron",
        error: "No se pudieron guardar los datos",
      })
      // El nombre se ve en la barra lateral: se vuelve a leer la sesión
      if (respuesta.isOk()) await refrescarSesion()
      return respuesta.isOk()
    },
    [refrescarSesion],
  )

  const cambiarContrasena = React.useCallback(async (values: CambiarPasswordValues): Promise<boolean> => {
    const respuesta = await toastResponse(cambiarPassword({ password_actual: values.passwordActual, password_nueva: values.passwordNueva }), {
      loading: "Actualizando tu contraseña…",
      success: "Contraseña actualizada",
      successDescription: "Se cerraron tus otras sesiones.",
      error: "No se pudo cambiar la contraseña",
    })
    return respuesta.isOk()
  }, [])

  return { guardarDatos, cambiarContrasena }
}
