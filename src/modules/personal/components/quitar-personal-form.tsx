"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { toast } from "@/shared/components/ui/toast"
import type { MiembroPersonalDto } from "@/dtos/personal"
import type { ErrorApi } from "@/lib/api/error-api"
import { quitarPersonalAction } from "../actions/personal.actions"
import { quitarPersonalSchema, type QuitarPersonalValues } from "../schema"

export const FORMULARIO_QUITAR_PERSONAL = "formulario-quitar-personal"

interface QuitarPersonalFormProps {
  miembro: MiembroPersonalDto
  onGuardado: () => void
}

export function QuitarPersonalForm({ miembro, onGuardado }: QuitarPersonalFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<QuitarPersonalValues>({
    resolver: zodResolver(quitarPersonalSchema),
    defaultValues: {
      motivo: "",
    },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await quitarPersonalAction(miembro.usuario_id, {
      motivo: valores.motivo.trim(),
    })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.motivo) {
        form.setError("motivo", { message: validaciones.motivo })
      }
      if (res.error.codigo === "PER-005") {
        form.setError("motivo", { message: res.error.message })
      }
      return setError(res.error)
    }

    toast.add({ type: "success", title: "Persona quitada del personal" })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_QUITAR_PERSONAL} onSubmit={guardar} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos quitar a la persona</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/30 p-3 text-[13px]">
        <p className="font-semibold text-foreground">
          {miembro.nombres} {miembro.apellidos}
        </p>
        <p className="text-muted-foreground">{miembro.correo_electronico}</p>
      </div>

      <p className="text-[13px] text-muted-foreground">
        Esta persona perderá el acceso a la administración de tu tienda de forma inmediata.
      </p>

      <FloatingTextarea
        label="Motivo por el que se retira (obligatorio)"
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
