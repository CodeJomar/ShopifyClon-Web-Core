"use client"

import * as React from "react"

import { puedeCon, type Puede } from "@/shared/constants/permisos"
import { useSession } from "../components/session-provider"

/**
 * Permisos de la sesión actual. Es el único punto de la interfaz que decide "¿puede o no puede?":
 *   const { puede } = useCan()
 *   puede({ modulo: MODULO.MENU, accion: ACCION.CREAR })
 * Solo UX: la API vuelve a autorizar cada operación.
 */
export function useCan(): { puede: Puede; esPropietario: boolean } {
  const { permisos, tipo_cuenta } = useSession()
  return React.useMemo(
    () => ({ puede: puedeCon(permisos), esPropietario: tipo_cuenta === "OWNER" }),
    [permisos, tipo_cuenta],
  )
}
