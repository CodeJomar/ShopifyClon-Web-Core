"use client"

import * as React from "react"
import { Lock } from "lucide-react"
import { FloatingInput, type FloatingInputProps } from "@/shared/components/composed/floating-input"

/**
 * Contraseña de los formularios de auth (docs/diseno-web.md §4.2): `Lock` de referencia a la izquierda;
 * el botón mostrar/ocultar de la derecha lo pone `FloatingInput` para `type="password"`.
 */
export const CampoContrasena = React.forwardRef<HTMLInputElement, FloatingInputProps>((props, ref) => (
  <FloatingInput
    ref={ref}
    type="password"
    autoComplete={props.autoComplete ?? "current-password"}
    leftIcon={<Lock className="size-4" aria-hidden="true" />}
    {...props}
  />
))
CampoContrasena.displayName = "CampoContrasena"
