"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { toast } from "@/shared/components/ui/toast"
import { ROL } from "@/shared/constants/permisos"
import type { ErrorApi } from "@/lib/api/error-api"
import { agregarPersonalAction } from "../actions/personal.actions"
import { agregarPersonalSchema, type AgregarPersonalValues } from "../schema"

export const FORMULARIO_AGREGAR_PERSONAL = "formulario-agregar-personal"

interface AgregarPersonalFormProps {
  rolUsuarioActual?: string
  onGuardado: () => void
}

export function AgregarPersonalForm({ rolUsuarioActual, onGuardado }: AgregarPersonalFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<AgregarPersonalValues>({
    resolver: zodResolver(agregarPersonalSchema),
    defaultValues: {
      correo_electronico: "",
      rol: "GESTOR_CATALOGO",
    },
  })

  const rolSeleccionado = useWatch({ control: form.control, name: "rol" })
  const esPropietario = rolUsuarioActual === ROL.PROPIETARIO

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await agregarPersonalAction({
      correo_electronico: valores.correo_electronico.trim().toLowerCase(),
      rol: valores.rol,
    })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.correoElectronico || validaciones.correo_electronico) {
        form.setError("correo_electronico", {
          message: validaciones.correoElectronico || validaciones.correo_electronico,
        })
      }
      if (validaciones.rol) {
        form.setError("rol", { message: validaciones.rol })
      }

      if (res.error.codigo === "PER-001" || res.error.codigo === "PER-006" || res.error.codigo === "PER-003") {
        form.setError("correo_electronico", { message: res.error.message })
      } else if (res.error.codigo === "PER-004") {
        form.setError("rol", { message: res.error.message })
      }

      return setError(res.error)
    }

    toast.add({ type: "success", title: "Persona agregada al personal" })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_AGREGAR_PERSONAL} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos agregar al personal</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <FloatingInput
        label="Correo electrónico del usuario"
        type="email"
        state={form.formState.errors.correo_electronico ? "error" : "default"}
        mensajeError={form.formState.errors.correo_electronico?.message}
        ayuda="Debe ser una persona con cuenta activa registrada en la plataforma (PER-001)."
        {...form.register("correo_electronico")}
      />

      <FloatingSelect
        label="Rol asignado"
        value={rolSeleccionado}
        onValueChange={(val) =>
          form.setValue("rol", val as AgregarPersonalValues["rol"], { shouldValidate: true })
        }
      >
        <SelectContent>
          {esPropietario && <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>}
          <SelectItem value="GESTOR_CATALOGO">Gestor de catálogo</SelectItem>
          <SelectItem value="GESTOR_PEDIDOS">Gestor de pedidos</SelectItem>
        </SelectContent>
      </FloatingSelect>
      {form.formState.errors.rol && (
        <p className="text-[11px] font-bold text-destructive-text">{form.formState.errors.rol.message}</p>
      )}
    </form>
  )
}
