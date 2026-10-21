"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { toast } from "@/shared/components/ui/toast"
import type { SuscripcionPlataformaDto } from "@/dtos/plataforma"
import type { ErrorApi } from "@/lib/api/error-api"
import { reactivarTiendaAction, suspenderTiendaAction } from "../actions/plataforma.actions"
import { motivoTiendaSchema, type MotivoTiendaValues } from "../schema"

export const FORMULARIO_ESTADO_TIENDA_PLATAFORMA = "formulario-estado-tienda-plataforma"

interface SuspenderTiendaFormProps {
  suscripcion: SuscripcionPlataformaDto
  accion: "suspender" | "reactivar"
  onGuardado: () => void
}

export function SuspenderTiendaForm({ suscripcion, accion, onGuardado }: SuspenderTiendaFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const esSuspension = accion === "suspender"

  const form = useForm<MotivoTiendaValues>({
    resolver: zodResolver(motivoTiendaSchema),
    defaultValues: {
      motivo: "",
    },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = esSuspension
      ? await suspenderTiendaAction(suscripcion.tienda_id, { motivo: valores.motivo.trim() })
      : await reactivarTiendaAction(suscripcion.tienda_id, { motivo: valores.motivo.trim() })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.motivo) form.setError("motivo", { message: validaciones.motivo })
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: esSuspension ? "Tienda suspendida" : "Tienda reactivada",
      description: `La tienda ${suscripcion.subdominio} fue ${esSuspension ? "suspendida" : "reactivada"} correctamente.`,
    })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_ESTADO_TIENDA_PLATAFORMA} onSubmit={guardar} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos procesar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/20 p-3.5 text-[13px] space-y-1">
        <p className="font-semibold text-foreground">Tienda: {suscripcion.subdominio}</p>
        <p className="text-muted-foreground">
          {esSuspension
            ? "Al suspender la tienda (SUS-010), la vitrina pública y el panel quedan bloqueados inmediatamente."
            : "Al reactivar la tienda, esta volverá a su estado operativo anterior a la suspensión."}
        </p>
      </div>

      <FloatingTextarea
        label="Motivo (obligatorio)"
        rows={3}
        state={form.formState.errors.motivo ? "error" : "default"}
        {...form.register("motivo")}
      />
      <p className="text-[11px] text-muted-foreground">
        Debe tener entre 5 y 255 caracteres.
      </p>
      {form.formState.errors.motivo && (
        <p className="text-[11px] font-bold text-destructive-text">
          {form.formState.errors.motivo.message}
        </p>
      )}
    </form>
  )
}
