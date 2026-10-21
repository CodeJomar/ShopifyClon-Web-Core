"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { toast } from "@/shared/components/ui/toast"
import { formatearFecha } from "@/shared/utils/fechas"
import type { SuscripcionPanelDto } from "@/dtos/suscripcion"
import type { ErrorApi } from "@/lib/api/error-api"
import { cancelarSuscripcionAction } from "../actions/suscripcion.actions"
import { cancelarSuscripcionSchema, type CancelarSuscripcionValues } from "../schema"

export const FORMULARIO_CANCELAR_SUSCRIPCION = "formulario-cancelar-suscripcion"

interface CancelarSuscripcionFormProps {
  suscripcion: SuscripcionPanelDto
  zonaHoraria?: string
  onGuardado: () => void
}

export function CancelarSuscripcionForm({
  suscripcion,
  zonaHoraria = "America/Lima",
  onGuardado,
}: CancelarSuscripcionFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<CancelarSuscripcionValues>({
    resolver: zodResolver(cancelarSuscripcionSchema),
    defaultValues: {
      motivo: "",
    },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await cancelarSuscripcionAction({
      motivo: valores.motivo.trim(),
    })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.motivo) form.setError("motivo", { message: validaciones.motivo })
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: "Cancelación programada",
      description: "Tu suscripción ha sido cancelada.",
    })
    onGuardado()
  })

  const esPrueba = suscripcion.estado === "PRUEBA"

  return (
    <form id={FORMULARIO_CANCELAR_SUSCRIPCION} onSubmit={guardar} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cancelar la suscripción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/20 p-3.5 text-[13px] text-foreground space-y-1">
        <p className="font-bold">Efecto de la cancelación (SUS-009):</p>
        {esPrueba ? (
          <p className="text-muted-foreground">
            Al estar en periodo de prueba, la cancelación es inmediata y la vitrina dejará de recibir compras de inmediato.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Tu tienda seguirá operando hasta el fin del periodo ({formatearFecha(suscripcion.fin_periodo, zonaHoraria)}). Llegada esa fecha, no se renovará y la tienda se suspenderá. Puedes revertir esta decisión en cualquier momento antes del fin del periodo.
          </p>
        )}
      </div>

      <FloatingTextarea
        label="Motivo de la cancelación (obligatorio)"
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
