"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { toast } from "@/shared/components/ui/toast"
import { TarjetaPlan } from "@/modules/tienda/components/tarjeta-plan"
import type { PlanDto } from "@/dtos/tienda"
import type { SuscripcionPanelDto } from "@/dtos/suscripcion"
import type { ErrorApi } from "@/lib/api/error-api"
import { cambiarPlanAction } from "../actions/suscripcion.actions"
import { cambiarPlanSchema, type CambiarPlanValues } from "../schema"

export const FORMULARIO_CAMBIAR_PLAN = "formulario-cambiar-plan"

interface CambiarPlanFormProps {
  planes: PlanDto[]
  suscripcion: SuscripcionPanelDto
  onGuardado: () => void
}

export function CambiarPlanForm({ planes, suscripcion, onGuardado }: CambiarPlanFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<CambiarPlanValues>({
    resolver: zodResolver(cambiarPlanSchema),
    defaultValues: {
      codigo_plan: suscripcion.codigo_plan,
      ciclo: suscripcion.ciclo ?? "MENSUAL",
      modo_pago: "tok_simulado",
    },
  })

  const codigoPlanSeleccionado = useWatch({ control: form.control, name: "codigo_plan" })
  const cicloSeleccionado = useWatch({ control: form.control, name: "ciclo" })
  const modoPagoSeleccionado = useWatch({ control: form.control, name: "modo_pago" })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await cambiarPlanAction({
      codigo_plan: valores.codigo_plan,
      ciclo: valores.ciclo,
      token_pago: valores.modo_pago,
    })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.codigo_plan || validaciones.codigoPlan) {
        form.setError("codigo_plan", { message: validaciones.codigo_plan || validaciones.codigoPlan })
      }
      if (validaciones.ciclo) form.setError("ciclo", { message: validaciones.ciclo })
      if (validaciones.token_pago || validaciones.tokenPago) {
        form.setError("modo_pago", { message: validaciones.token_pago || validaciones.tokenPago })
      }
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: "Plan actualizado",
      description: `Ahora tu tienda cuenta con el plan ${valores.codigo_plan}.`,
    })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_CAMBIAR_PLAN} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cambiar el plan</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div>
        <p className="text-[13px] font-semibold text-foreground">Selecciona el nuevo plan</p>
        <p className="text-[12px] text-muted-foreground">
          El cambio se aplica de inmediato e inicia un nuevo período de facturación (SUS-008).
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Planes de suscripción disponibles"
        className="space-y-3"
      >
        {planes.map((plan, index) => (
          <TarjetaPlan
            key={plan.codigo}
            plan={plan}
            seleccionada={codigoPlanSeleccionado === plan.codigo}
            enfoque={codigoPlanSeleccionado ? codigoPlanSeleccionado === plan.codigo : index === 0}
            onSeleccionar={() => form.setValue("codigo_plan", plan.codigo, { shouldValidate: true })}
            onTecla={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                form.setValue("codigo_plan", plan.codigo, { shouldValidate: true })
              }
            }}
            destacada={plan.codigo === "ESTANDAR"}
          />
        ))}
      </div>
      {form.formState.errors.codigo_plan && (
        <p className="text-[11px] font-bold text-destructive-text">
          {form.formState.errors.codigo_plan.message}
        </p>
      )}

      <FloatingSelect
        label="Ciclo de facturación"
        value={cicloSeleccionado}
        onValueChange={(val) =>
          form.setValue("ciclo", val as CambiarPlanValues["ciclo"], { shouldValidate: true })
        }
      >
        <SelectContent>
          <SelectItem value="MENSUAL">Mensual</SelectItem>
          <SelectItem value="ANUAL">Anual</SelectItem>
        </SelectContent>
      </FloatingSelect>
      {form.formState.errors.ciclo && (
        <p className="text-[11px] font-bold text-destructive-text">
          {form.formState.errors.ciclo.message}
        </p>
      )}

      <FloatingSelect
        label="Pago simulado"
        value={modoPagoSeleccionado}
        onValueChange={(val) =>
          form.setValue("modo_pago", val as CambiarPlanValues["modo_pago"], { shouldValidate: true })
        }
      >
        <SelectContent>
          <SelectItem value="tok_simulado">Aprobar pago (simulado)</SelectItem>
          <SelectItem value="tok_rechazar">Rechazar pago (simular fallo)</SelectItem>
        </SelectContent>
      </FloatingSelect>
      {form.formState.errors.modo_pago && (
        <p className="text-[11px] font-bold text-destructive-text">
          {form.formState.errors.modo_pago.message}
        </p>
      )}

      <div className="rounded-xl border border-dashed bg-muted/30 p-3 text-[12px] text-muted-foreground">
        <p className="font-semibold text-foreground">Pasarela simulada</p>
        <p className="mt-0.5">Modo de prueba: no se cobra dinero real.</p>
      </div>
    </form>
  )
}
