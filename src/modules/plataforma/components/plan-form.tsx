"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Label } from "@/shared/components/ui/label"
import { toast } from "@/shared/components/ui/toast"
import type { PlanPlataformaDto } from "@/dtos/plataforma"
import type { ErrorApi } from "@/lib/api/error-api"
import { actualizarPlanAction, crearPlanAction } from "../actions/plataforma.actions"
import { crearPlanSchema, type CrearPlanValues } from "../schema"

export const FORMULARIO_PLAN = "formulario-plan"

interface PlanFormProps {
  plan?: PlanPlataformaDto | null
  onGuardado: () => void
}

export function PlanForm({ plan, onGuardado }: PlanFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const esEdicion = Boolean(plan)

  const form = useForm<CrearPlanValues>({
    resolver: zodResolver(crearPlanSchema),
    defaultValues: {
      codigo: plan?.codigo ?? "",
      nombre: plan?.nombre ?? "",
      descripcion: plan?.descripcion ?? "",
      precio_mensual: plan ? String(plan.precio_mensual) : "29",
      precio_anual: plan ? String(plan.precio_anual ?? 290) : "290",
      moneda: plan?.moneda ?? "USD",
      limite_productos: plan?.limite_productos != null ? String(plan.limite_productos) : "",
      limite_personal: plan ? String(plan.limite_personal) : "2",
      comision_porcentaje: plan ? String(Number((plan.porcentaje_comision * 100).toFixed(2))) : "2",
      dias_prueba: plan ? String(plan.dias_prueba) : "14",
      es_publico: plan?.es_publico ?? true,
      orden: plan ? String(plan.orden) : "0",
    },
  })

  const esPublico = useWatch({ control: form.control, name: "es_publico" })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const comisionNum = Number(valores.comision_porcentaje)
    const comisionFraccion = Number((comisionNum / 100).toFixed(4))

    const datosBase = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion?.trim() || null,
      precio_mensual: Number(valores.precio_mensual),
      precio_anual: Number(valores.precio_anual),
      moneda: valores.moneda.trim().toUpperCase(),
      limite_productos: valores.limite_productos ? Number(valores.limite_productos) : null,
      limite_personal: Number(valores.limite_personal),
      porcentaje_comision: comisionFraccion,
      dias_prueba: Number(valores.dias_prueba),
      es_publico: valores.es_publico,
      orden: Number(valores.orden),
    }

    const res = esEdicion && plan
      ? await actualizarPlanAction(plan.codigo, datosBase)
      : await crearPlanAction({
          codigo: valores.codigo.trim().toUpperCase(),
          ...datosBase,
        })

    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      if (validaciones.codigo) form.setError("codigo", { message: validaciones.codigo })
      if (validaciones.nombre) form.setError("nombre", { message: validaciones.nombre })
      if (validaciones.descripcion) form.setError("descripcion", { message: validaciones.descripcion })
      if (validaciones.precio_mensual || validaciones.precioMensual) {
        form.setError("precio_mensual", { message: validaciones.precio_mensual || validaciones.precioMensual })
      }
      if (validaciones.precio_anual || validaciones.precioAnual) {
        form.setError("precio_anual", { message: validaciones.precio_anual || validaciones.precioAnual })
      }
      if (validaciones.moneda) form.setError("moneda", { message: validaciones.moneda })
      if (validaciones.limite_productos || validaciones.limiteProductos) {
        form.setError("limite_productos", { message: validaciones.limite_productos || validaciones.limiteProductos })
      }
      if (validaciones.limite_personal || validaciones.limitePersonal) {
        form.setError("limite_personal", { message: validaciones.limite_personal || validaciones.limitePersonal })
      }
      if (validaciones.porcentaje_comision || validaciones.porcentajeComision) {
        form.setError("comision_porcentaje", { message: validaciones.porcentaje_comision || validaciones.porcentajeComision })
      }
      if (validaciones.dias_prueba || validaciones.diasPrueba) {
        form.setError("dias_prueba", { message: validaciones.dias_prueba || validaciones.diasPrueba })
      }
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: esEdicion ? "Plan actualizado" : "Plan creado",
      description: `El plan ${valores.nombre.trim()} fue guardado correctamente.`,
    })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_PLAN} onSubmit={guardar} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar el plan</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!esEdicion && (
        <div>
          <FloatingInput
            label="Código (p. ej. PRO_2026)"
            state={form.formState.errors.codigo ? "error" : "default"}
            {...form.register("codigo")}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            De 3 a 30 caracteres en mayúsculas y guiones bajos. No podrá modificarse luego.
          </p>
          {form.formState.errors.codigo && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.codigo.message}
            </p>
          )}
        </div>
      )}

      <div>
        <FloatingInput
          label="Nombre del plan"
          state={form.formState.errors.nombre ? "error" : "default"}
          {...form.register("nombre")}
        />
        {form.formState.errors.nombre && (
          <p className="mt-1 text-[11px] font-bold text-destructive-text">
            {form.formState.errors.nombre.message}
          </p>
        )}
      </div>

      <div>
        <FloatingTextarea
          label="Descripción (opcional)"
          rows={2}
          state={form.formState.errors.descripcion ? "error" : "default"}
          {...form.register("descripcion")}
        />
        {form.formState.errors.descripcion && (
          <p className="mt-1 text-[11px] font-bold text-destructive-text">
            {form.formState.errors.descripcion.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <FloatingInput
            label="Precio mensual"
            type="number"
            step="0.01"
            min="0"
            state={form.formState.errors.precio_mensual ? "error" : "default"}
            {...form.register("precio_mensual")}
          />
          {form.formState.errors.precio_mensual && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.precio_mensual.message}
            </p>
          )}
        </div>
        <div>
          <FloatingInput
            label="Precio anual"
            type="number"
            step="0.01"
            min="0"
            state={form.formState.errors.precio_anual ? "error" : "default"}
            {...form.register("precio_anual")}
          />
          {form.formState.errors.precio_anual && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.precio_anual.message}
            </p>
          )}
        </div>
        <div>
          <FloatingInput
            label="Moneda (3 letras)"
            maxLength={3}
            state={form.formState.errors.moneda ? "error" : "default"}
            {...form.register("moneda")}
          />
          {form.formState.errors.moneda && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.moneda.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FloatingInput
            label="Límite productos (vacío = ilimitado)"
            type="number"
            min="1"
            state={form.formState.errors.limite_productos ? "error" : "default"}
            {...form.register("limite_productos")}
          />
          {form.formState.errors.limite_productos && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.limite_productos.message}
            </p>
          )}
        </div>
        <div>
          <FloatingInput
            label="Límite personal adicional"
            type="number"
            min="0"
            state={form.formState.errors.limite_personal ? "error" : "default"}
            {...form.register("limite_personal")}
          />
          {form.formState.errors.limite_personal && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.limite_personal.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <FloatingInput
            label="Comisión (%)"
            type="number"
            step="0.01"
            min="0"
            max="10"
            state={form.formState.errors.comision_porcentaje ? "error" : "default"}
            {...form.register("comision_porcentaje")}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">0 % a 10 %</p>
          {form.formState.errors.comision_porcentaje && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.comision_porcentaje.message}
            </p>
          )}
        </div>
        <div>
          <FloatingInput
            label="Días de prueba"
            type="number"
            min="0"
            state={form.formState.errors.dias_prueba ? "error" : "default"}
            {...form.register("dias_prueba")}
          />
          {form.formState.errors.dias_prueba && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.dias_prueba.message}
            </p>
          )}
        </div>
        <div>
          <FloatingInput
            label="Orden de visualización"
            type="number"
            state={form.formState.errors.orden ? "error" : "default"}
            {...form.register("orden")}
          />
          {form.formState.errors.orden && (
            <p className="mt-1 text-[11px] font-bold text-destructive-text">
              {form.formState.errors.orden.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="switch-es-publico" className="text-[13px] font-medium text-foreground">
            Plan visible al público
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Si está desactivado, el plan no se ofrecerá a nuevas tiendas en la selección de planes.
          </p>
        </div>
        <Switch
          id="switch-es-publico"
          checked={Boolean(esPublico)}
          onCheckedChange={(checked) => form.setValue("es_publico", checked)}
        />
      </div>
    </form>
  )
}
