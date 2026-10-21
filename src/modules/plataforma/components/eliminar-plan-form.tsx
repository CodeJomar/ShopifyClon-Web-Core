"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { toast } from "@/shared/components/ui/toast"
import type { PlanPlataformaDto } from "@/dtos/plataforma"
import type { ErrorApi } from "@/lib/api/error-api"
import { eliminarPlanAction } from "../actions/plataforma.actions"

export const FORMULARIO_ELIMINAR_PLAN = "formulario-eliminar-plan"

interface EliminarPlanFormProps {
  plan: PlanPlataformaDto
  onGuardado: () => void
}

export function EliminarPlanForm({ plan, onGuardado }: EliminarPlanFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await eliminarPlanAction(plan.codigo)
    if (!res.ok) {
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: "Plan retirado",
      description: `El plan ${plan.nombre} fue retirado del catálogo público.`,
    })
    onGuardado()
  }

  return (
    <form id={FORMULARIO_ELIMINAR_PLAN} onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo retirar el plan</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-[13px]">
        <p className="font-semibold text-foreground">
          Plan: {plan.nombre} ({plan.codigo})
        </p>
        <p className="text-muted-foreground">
          De acuerdo con la regla <strong>SUS-013</strong>, los planes nunca se eliminan de la base de datos si cuentan con suscripciones activas. Al confirmar, este plan se marcará como <strong>no público</strong> y ya no se ofrecerá a nuevas tiendas.
        </p>
      </div>

      <p className="text-[12px] text-muted-foreground">
        Las tiendas que actualmente utilicen este plan continuarán con él sin interrupciones.
      </p>

      <input type="submit" className="hidden" />
    </form>
  )
}
