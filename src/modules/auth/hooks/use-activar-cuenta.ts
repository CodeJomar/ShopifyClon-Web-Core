"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { toastResponse } from "@/shared/utils/toast-response"
import { activarCuentaAction, validarActivacionAction } from "../actions/auth.actions"

export type ActivarCuentaEstado = "validando" | "valido" | "invalido"

export function useActivarCuenta(token: string | undefined) {
  const router = useRouter()
  const [estado, setEstado] = React.useState<ActivarCuentaEstado>(token ? "validando" : "invalido")
  const [nombre, setNombre] = React.useState("")
  const [mensajeInvalido, setMensajeInvalido] = React.useState("El enlace de activación no es válido.")

  // Al abrir el enlace se valida el token (sin consumirlo) para avisar de inmediato si venció.
  React.useEffect(() => {
    if (!token) return
    let cancelado = false

    validarActivacionAction(token).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setNombre(res.datos.nombre)
        setEstado("valido")
        // El token ya no necesita permanecer visible en la barra de direcciones ni en el historial.
        window.history.replaceState(null, "", window.location.pathname)
      } else {
        setMensajeInvalido(res.mensaje)
        setEstado("invalido")
      }
    })

    return () => {
      cancelado = true
    }
  }, [token])

  const activar = async (password: string): Promise<void> => {
    if (!token) return setEstado("invalido")

    const res = await toastResponse(activarCuentaAction(token, password), {
      loading: "Activando cuenta...",
      success: "Cuenta activada",
      successDescription: "Ya puedes iniciar sesión con tu contraseña.",
      error: "No se pudo activar la cuenta",
    })

    if (res.ok) {
      router.replace("/login")
    } else if (res.estado === 400 && /enlace/i.test(res.mensaje)) {
      setMensajeInvalido(res.mensaje)
      setEstado("invalido")
    }
  }

  return { estado, nombre, mensajeInvalido, activar }
}
