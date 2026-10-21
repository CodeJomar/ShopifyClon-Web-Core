"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { Switch } from "@/shared/components/ui/switch"
import { toast } from "@/shared/components/ui/toast"
import type { TarifaEnvioDto, TarifaEnvioRequest } from "@/dtos/envio"
import type { ErrorApi } from "@/lib/api/error-api"
import { crearTarifaEnvioAction, editarTarifaEnvioAction } from "../actions/envios.actions"
import { tarifaEnvioSchema, type TarifaEnvioValues } from "../schema"

export const FORMULARIO_TARIFA = "formulario-tarifa"

const mapeoCampos: Record<string, keyof TarifaEnvioValues> = {
  nombre: "nombre",
  descripcion: "descripcion",
  precio: "precio",
  montoMinimoGratis: "monto_minimo_gratis",
  monto_minimo_gratis: "monto_minimo_gratis",
  estaActiva: "esta_activa",
  esta_activa: "esta_activa",
  orden: "orden",
}

interface TarifaEnvioFormProps {
  inicial?: TarifaEnvioDto
  onGuardado: () => void
}

export function TarifaEnvioForm({ inicial, onGuardado }: TarifaEnvioFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<TarifaEnvioValues>({
    resolver: zodResolver(tarifaEnvioSchema),
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
      precio: inicial ? String(inicial.precio) : "",
      monto_minimo_gratis: inicial?.monto_minimo_gratis != null ? String(inicial.monto_minimo_gratis) : "",
      orden: inicial ? String(inicial.orden) : "0",
      esta_activa: inicial?.esta_activa ?? true,
    },
  })

  const estaActiva = useWatch({ control: form.control, name: "esta_activa" })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const datos: TarifaEnvioRequest = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion?.trim() || undefined,
      precio: Number(valores.precio),
      monto_minimo_gratis: valores.monto_minimo_gratis ? Number(valores.monto_minimo_gratis) : undefined,
      orden: valores.orden ? Number(valores.orden) : 0,
      esta_activa: valores.esta_activa,
    }

    const res = inicial ? await editarTarifaEnvioAction(inicial.id, datos) : await crearTarifaEnvioAction(datos)
    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      for (const [campo, mensaje] of Object.entries(validaciones)) {
        const campoMapeado = mapeoCampos[campo]
        if (campoMapeado) {
          form.setError(campoMapeado, { message: mensaje })
        }
      }
      return setError(res.error)
    }

    toast.add({ type: "success", title: inicial ? "Tarifa actualizada" : "Tarifa creada" })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_TARIFA} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar la tarifa</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <FloatingInput
        label="Nombre de la tarifa"
        state={form.formState.errors.nombre ? "error" : "default"}
        mensajeError={form.formState.errors.nombre?.message}
        ayuda="Ej: Envío estándar (3–5 días), Express, etc."
        {...form.register("nombre")}
      />

      <FloatingTextarea
        label="Descripción (opcional)"
        rows={3}
        state={form.formState.errors.descripcion ? "error" : "default"}
        {...form.register("descripcion")}
      />
      {form.formState.errors.descripcion && (
        <p className="text-[11px] font-bold text-destructive-text">
          {form.formState.errors.descripcion.message}
        </p>
      )}

      <FloatingInput
        label="Precio de envío"
        type="number"
        step="0.01"
        state={form.formState.errors.precio ? "error" : "default"}
        mensajeError={form.formState.errors.precio?.message}
        ayuda="Costo del envío para el comprador. Usa 0 para envío gratuito siempre."
        {...form.register("precio")}
      />

      <FloatingInput
        label="Envío gratis a partir de (opcional)"
        type="number"
        step="0.01"
        state={form.formState.errors.monto_minimo_gratis ? "error" : "default"}
        mensajeError={form.formState.errors.monto_minimo_gratis?.message}
        ayuda="Si el subtotal tras descuentos alcanza este monto, el envío será gratis."
        {...form.register("monto_minimo_gratis")}
      />

      <FloatingInput
        label="Orden de prioridad (opcional)"
        type="number"
        step="1"
        state={form.formState.errors.orden ? "error" : "default"}
        mensajeError={form.formState.errors.orden?.message}
        ayuda="Define el orden en que se mostrará en el checkout (menor número primero)."
        {...form.register("orden")}
      />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-input p-3">
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-foreground">Tarifa activa</p>
          <p className="text-[11px] text-muted-foreground">Solo las tarifas activas se ofrecen a los compradores en el checkout.</p>
        </div>
        <Switch
          checked={estaActiva}
          onCheckedChange={(checked) => form.setValue("esta_activa", checked, { shouldValidate: true })}
        />
      </div>
    </form>
  )
}
