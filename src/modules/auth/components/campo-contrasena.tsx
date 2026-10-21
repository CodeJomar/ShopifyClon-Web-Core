"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { FloatingInput, type FloatingInputProps } from "@/shared/components/composed/floating-input"

/** Contraseña con el botón de mostrar/ocultar (docs/diseno-web.md §4.2: el ícono va a la derecha del campo). */
export const CampoContrasena = React.forwardRef<HTMLInputElement, FloatingInputProps>(({ label, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false)

  return (
    <FloatingInput
      ref={ref}
      label={label}
      type={visible ? "text" : "password"}
      autoComplete={props.autoComplete ?? "current-password"}
      rightIcon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25"
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  )
})
CampoContrasena.displayName = "CampoContrasena"
