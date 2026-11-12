"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { toast } from "@/shared/components/ui/toast"
import { aDatetimeLocalLima, datetimeLocalLimaAIso } from "@/shared/utils/fechas"
import type { CuponDto, CuponRequest, TipoDescuento } from "@/dtos/cupon"
import type { ErrorApi } from "@/lib/api/error-api"
import { crearCuponAction, editarCuponAction } from "../actions/cupones.actions"
import { cuponSchema, type CuponValues } from "../schema"

export const FORMULARIO_CUPON = "formulario-cupon"

// Las fechas del cupón se editan y se guardan en hora de Lima (no en la del navegador), igual que se muestran.
const aDatetimeLocal = aDatetimeLocalLima
const datetimeLocalAIso = datetimeLocalLimaAIso

const mapeoCampos: Record<string, keyof CuponValues> = {
  codigo: "codigo",
  tipoDescuento: "tipo_descuento",
  tipo_descuento: "tipo_descuento",
  valorDescuento: "valor_descuento",
  valor_descuento: "valor_descuento",
  montoMinimoCompra: "monto_minimo_compra",
  monto_minimo_compra: "monto_minimo_compra",
  limiteUsosTotal: "limite_usos_total",
  limite_usos_total: "limite_usos_total",
  fechaInicio: "fecha_inicio",
  fecha_inicio: "fecha_inicio",
  fechaFin: "fecha_fin",
  fecha_fin: "fecha_fin",
  estaActivo: "esta_activo",
  esta_activo: "esta_activo",
}

interface CuponFormProps {
  inicial?: CuponDto
  onGuardado: () => void
}

export function CuponForm({ inicial, onGuardado }: CuponFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<CuponValues>({
    resolver: zodResolver(cuponSchema),
    defaultValues: {
      codigo: inicial?.codigo ?? "",
      tipo_descuento: inicial?.tipo_descuento ?? "PORCENTAJE",
      valor_descuento: inicial ? String(inicial.valor_descuento) : "",
      monto_minimo_compra: inicial?.monto_minimo_compra != null ? String(inicial.monto_minimo_compra) : "",
      limite_usos_total: inicial?.limite_usos_total != null ? String(inicial.limite_usos_total) : "",
      fecha_inicio: inicial ? aDatetimeLocal(inicial.fecha_inicio) : aDatetimeLocal(new Date().toISOString()),
      fecha_fin: inicial?.fecha_fin ? aDatetimeLocal(inicial.fecha_fin) : "",
      esta_activo: inicial?.esta_activo ?? true,
    },
  })

  const tipoDescuento = useWatch({ control: form.control, name: "tipo_descuento" })
  const estaActivo = useWatch({ control: form.control, name: "esta_activo" })
  const regCodigo = form.register("codigo")

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const datos: CuponRequest = {
      codigo: valores.codigo.trim().toUpperCase(),
      tipo_descuento: valores.tipo_descuento,
      valor_descuento: valores.tipo_descuento === "ENVIO_GRATIS" ? 0 : Number(valores.valor_descuento),
      monto_minimo_compra: valores.monto_minimo_compra ? Number(valores.monto_minimo_compra) : undefined,
      limite_usos_total: valores.limite_usos_total ? Number(valores.limite_usos_total) : undefined,
      fecha_inicio: datetimeLocalAIso(valores.fecha_inicio),
      fecha_fin: datetimeLocalAIso(valores.fecha_fin),
      esta_activo: valores.esta_activo,
    }

    const res = inicial ? await editarCuponAction(inicial.id, datos) : await crearCuponAction(datos)
    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      for (const [campo, mensaje] of Object.entries(validaciones)) {
        const campoMapeado = mapeoCampos[campo]
        if (campoMapeado) {
          form.setError(campoMapeado, { message: mensaje })
        }
      }
      if (res.error.codigo === "CUP-001") {
        form.setError("codigo", { message: res.error.message })
      } else if (res.error.codigo === "CUP-002") {
        form.setError("valor_descuento", { message: res.error.message })
      } else if (res.error.codigo === "CUP-009") {
        form.setError("fecha_fin", { message: res.error.message })
      }
      return setError(res.error)
    }

    toast.add({ type: "success", title: inicial ? "Cupón actualizado" : "Cupón creado" })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_CUPON} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar el cupón</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <FloatingInput
        label="Código del cupón"
        state={form.formState.errors.codigo ? "error" : "default"}
        mensajeError={form.formState.errors.codigo?.message}
        ayuda="De 3 a 50 caracteres (letras mayúsculas, números, guión o guión bajo)."
        {...regCodigo}
        onChange={(e) => {
          e.target.value = e.target.value.toUpperCase()
          regCodigo.onChange(e)
        }}
      />

      <FloatingSelect
        label="Tipo de descuento"
        value={tipoDescuento}
        onValueChange={(val) => {
          const nuevoTipo = val as TipoDescuento
          form.setValue("tipo_descuento", nuevoTipo, { shouldValidate: true })
          if (nuevoTipo === "ENVIO_GRATIS") {
            form.setValue("valor_descuento", "0", { shouldValidate: true })
          }
        }}
      >
        <SelectContent>
          <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
          <SelectItem value="MONTO_FIJO">Monto fijo</SelectItem>
          <SelectItem value="ENVIO_GRATIS">Envío gratis</SelectItem>
        </SelectContent>
      </FloatingSelect>

      {tipoDescuento !== "ENVIO_GRATIS" && (
        <FloatingInput
          label={tipoDescuento === "PORCENTAJE" ? "Porcentaje de descuento (1 – 100)" : "Monto de descuento"}
          type="number"
          step={tipoDescuento === "PORCENTAJE" ? "1" : "0.01"}
          state={form.formState.errors.valor_descuento ? "error" : "default"}
          mensajeError={form.formState.errors.valor_descuento?.message}
          {...form.register("valor_descuento")}
        />
      )}

      <FloatingInput
        label="Monto mínimo de compra (opcional)"
        type="number"
        step="0.01"
        state={form.formState.errors.monto_minimo_compra ? "error" : "default"}
        mensajeError={form.formState.errors.monto_minimo_compra?.message}
        ayuda="El cupón solo aplicará si el subtotal de la compra alcanza este monto."
        {...form.register("monto_minimo_compra")}
      />

      <FloatingInput
        label="Límite total de usos (opcional)"
        type="number"
        step="1"
        state={form.formState.errors.limite_usos_total ? "error" : "default"}
        mensajeError={form.formState.errors.limite_usos_total?.message}
        ayuda="Número máximo de veces que este cupón puede ser usado en la tienda."
        {...form.register("limite_usos_total")}
      />

      <FloatingInput
        label="Fecha y hora de inicio"
        type="datetime-local"
        state={form.formState.errors.fecha_inicio ? "error" : "default"}
        mensajeError={form.formState.errors.fecha_inicio?.message}
        {...form.register("fecha_inicio")}
      />

      <FloatingInput
        label="Fecha y hora de fin (opcional)"
        type="datetime-local"
        state={form.formState.errors.fecha_fin ? "error" : "default"}
        mensajeError={form.formState.errors.fecha_fin?.message}
        ayuda="Dejar vacío si el cupón no tiene fecha de caducidad."
        {...form.register("fecha_fin")}
      />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-input p-3">
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-foreground">Cupón activo</p>
          <p className="text-[11px] text-muted-foreground">Los cupones inactivos no pueden ser utilizados por los clientes.</p>
        </div>
        <Switch
          checked={estaActivo}
          onCheckedChange={(checked) => form.setValue("esta_activo", checked, { shouldValidate: true })}
        />
      </div>
    </form>
  )
}
