"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import type { SuscripcionPanelDto } from "@/dtos/suscripcion"
import type { ErrorApi } from "@/lib/api/error-api"
import { pagarSuscripcionAction } from "../actions/suscripcion.actions"
import { pagarSuscripcionSchema, type PagarSuscripcionValues } from "../schema"

export const FORMULARIO_PAGAR_SUSCRIPCION = "formulario-pagar-suscripcion"

interface PagarSuscripcionFormProps {
  suscripcion: SuscripcionPanelDto
  onGuardado: () => void
}

export function PagarSuscripcionForm({ suscripcion, onGuardado }: PagarSuscripcionFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<PagarSuscripcionValues>({
    resolver: zodResolver(pagarSuscripcionSchema),
    defaultValues: {
      ciclo: suscripcion.ciclo ?? "MENSUAL",
      modo_pago: "tok_simulado",
    },
  })

  const cicloSeleccionado = useWatch({ control: form.control, name: "ciclo" })
  const modoPagoSeleccionado = useWatch({ control: form.control, name: "modo_pago" })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await pagarSuscripcionAction({
      ciclo: valores.ciclo,
      token_pago: valores.modo_pago,
      codigo_plan: suscripcion.codigo_plan,
    })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.ciclo) form.setError("ciclo", { message: validaciones.ciclo })
      if (validaciones.token_pago || validaciones.tokenPago) {
        form.setError("modo_pago", { message: validaciones.token_pago || validaciones.tokenPago })
      }
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: "Pago procesado",
      description: "Tu suscripción ha sido activada correctamente.",
    })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_PAGAR_SUSCRIPCION} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos procesar el pago</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-muted/20 p-4 space-y-1">
        <p className="text-[12px] font-medium text-muted-foreground">Plan a pagar</p>
        <p className="text-[15px] font-bold text-foreground">
          {suscripcion.nombre_plan} — {formatearDinero(suscripcion.precio_pactado, suscripcion.moneda)} / {cicloSeleccionado === "ANUAL" ? "año" : "mes"}
        </p>
      </div>

      <FloatingSelect
        label="Ciclo de facturación"
        value={cicloSeleccionado}
        onValueChange={(val) =>
          form.setValue("ciclo", val as PagarSuscripcionValues["ciclo"], { shouldValidate: true })
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
          form.setValue("modo_pago", val as PagarSuscripcionValues["modo_pago"], { shouldValidate: true })
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
