"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { logoutAction } from "../actions/auth.actions"

export function useLogout() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const logout = async () => {
    setIsLoggingOut(true)
    // Aunque la API no responda, se vuelve al login: las cookies expiran o se revocan en el servidor.
    await logoutAction()
    router.replace("/login")
  }

  return { logout, isLoggingOut }
}
