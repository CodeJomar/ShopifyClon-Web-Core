"use client"

import * as React from "react"

import type { Requisito } from "@/shared/constants/permisos"
import { useCan } from "../hooks/use-can"

interface CanProps extends Requisito {
  children: React.ReactNode
  /** Qué mostrar cuando no tiene permiso (por defecto, nada). */
  fallback?: React.ReactNode
}

/**
 * Muestra a sus hijos solo si la sesión tiene el permiso:
 *   <Can modulo={MODULO.MENU} accion={ACCION.CREAR}><Button>Nuevo producto</Button></Can>
 */
export function Can({ modulo, accion, children, fallback = null }: CanProps) {
  const { puede } = useCan()
  return <>{puede({ modulo, accion }) ? children : fallback}</>
}
