"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { toast } from "@/shared/components/ui/toast"
import { formatearFecha } from "@/shared/utils/fechas"
import type { SuscripcionPanelDto } from "@/dtos/suscripcion"
import type { ErrorApi } from "@/lib/api/error-api"
import { revertirCancelacionAction } from "../actions/suscripcion.actions"

export const FORMULARIO_REVERTIR_CANCELACION = "formulario-revertir-cancelacion"

interface RevertirCancelacionFormProps {
  suscripcion: SuscripcionPanelDto
  zonaHoraria?: string
  onGuardado: () => void
}

export function RevertirCancelacionForm({
  suscripcion,
  zonaHoraria = "America/Lima",
  onGuardado,
}: RevertirCancelacionFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [enviando, setEnviando] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)

    const res = await revertirCancelacionAction()
    setEnviando(false)

    if (!res.ok) {
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: "Cancelación revertida",
      description: "Tu suscripción continuará activa y se renovará automáticamente.",
    })
    onGuardado()
  }

  return (
    <form id={FORMULARIO_REVERTIR_CANCELACION} onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos revertir la cancelación</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-[13px]">
        <p className="font-semibold text-foreground">Continuar con tu plan actual</p>
        <p className="text-muted-foreground">
          Al revertir la cancelación, tu tienda seguirá activa y el cobro se intentará automáticamente el{" "}
          <strong className="text-foreground">{formatearFecha(suscripcion.fin_periodo, zonaHoraria)}</strong> para renovar el periodo.
        </p>
      </div>

      <p className="text-[12px] text-muted-foreground">
        Podrás cancelar nuevamente si lo deseas antes de que finalice el periodo actual.
      </p>

      {/* Hidden submit input if triggered via form attribute */}
      <input type="submit" disabled={enviando} className="hidden" />
    </form>
  )
}
