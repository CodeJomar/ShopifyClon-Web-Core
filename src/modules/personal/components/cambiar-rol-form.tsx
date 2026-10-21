"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { toast } from "@/shared/components/ui/toast"
import { ROL } from "@/shared/constants/permisos"
import type { MiembroPersonalDto } from "@/dtos/personal"
import type { ErrorApi } from "@/lib/api/error-api"
import { cambiarRolAction } from "../actions/personal.actions"
import { cambiarRolSchema, type CambiarRolValues } from "../schema"

export const FORMULARIO_CAMBIAR_ROL = "formulario-cambiar-rol"

interface CambiarRolFormProps {
  miembro: MiembroPersonalDto
  rolUsuarioActual?: string
  onGuardado: () => void
}

export function CambiarRolForm({ miembro, rolUsuarioActual, onGuardado }: CambiarRolFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const rolInicialValido =
    miembro.rol === "ADMINISTRADOR" || miembro.rol === "GESTOR_CATALOGO" || miembro.rol === "GESTOR_PEDIDOS"
      ? (miembro.rol as CambiarRolValues["rol"])
      : "GESTOR_CATALOGO"

  const form = useForm<CambiarRolValues>({
    resolver: zodResolver(cambiarRolSchema),
    defaultValues: {
      rol: rolInicialValido,
      motivo: "",
    },
  })

  const rolSeleccionado = useWatch({ control: form.control, name: "rol" })
  const esPropietario = rolUsuarioActual === ROL.PROPIETARIO

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await cambiarRolAction(miembro.usuario_id, {
      rol: valores.rol,
      motivo: valores.motivo.trim(),
    })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.rol) {
        form.setError("rol", { message: validaciones.rol })
      }
      if (validaciones.motivo) {
        form.setError("motivo", { message: validaciones.motivo })
      }
      if (res.error.codigo === "PER-004") {
        form.setError("rol", { message: res.error.message })
      } else if (res.error.codigo === "PER-005") {
        form.setError("motivo", { message: res.error.message })
      }
      return setError(res.error)
    }

    toast.add({ type: "success", title: "Rol de personal actualizado" })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_CAMBIAR_ROL} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cambiar el rol</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/30 p-3 text-[13px]">
        <p className="font-semibold text-foreground">
          {miembro.nombres} {miembro.apellidos}
        </p>
        <p className="text-muted-foreground">{miembro.correo_electronico}</p>
      </div>

      <FloatingSelect
        label="Nuevo rol"
        value={rolSeleccionado}
        onValueChange={(val) =>
          form.setValue("rol", val as CambiarRolValues["rol"], { shouldValidate: true })
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

      <FloatingTextarea
        label="Motivo del cambio (obligatorio)"
        rows={3}
        state={form.formState.errors.motivo ? "error" : "default"}
        {...form.register("motivo")}
      />
      <p className="text-[11px] text-muted-foreground">Debe tener entre 5 y 255 caracteres (PER-005).</p>
      {form.formState.errors.motivo && (
        <p className="text-[11px] font-bold text-destructive-text">{form.formState.errors.motivo.message}</p>
      )}
    </form>
  )
}
