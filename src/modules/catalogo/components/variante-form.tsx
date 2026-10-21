"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Switch } from "@/shared/components/ui/switch"
import { numeroOpcional, normalizarSku, varianteSchema, type VarianteValues } from "../schema"
import type { VarianteDto } from "@/dtos/catalogo"
import type { ErrorApi } from "@/lib/api/error-api"

export interface ResultadoEnvio {
  /** Mensaje general si la API rechaza el envío. */
  error?: ErrorApi
}

interface VarianteFormProps {
  /** Variante a editar; sin ella, se crea. */
  inicial?: VarianteDto
  /** Producto digital: la variante no requiere envío (CAT-005). */
  digital: boolean
  /** Solo quien gestiona el catálogo ve el costo (CAT-012). */
  verCosto: boolean
  /** Al crear, la cantidad inicial de stock. */
  mostrarCantidadInicial: boolean
  formId: string
  /** Envía los datos al padre (que llama a la API). Devuelve el error si lo hay. */
  onEnviar: (valores: VarianteValues) => Promise<ResultadoEnvio>
}

/** Formulario de una variante. Sin íconos: todos los campos van iguales (lección de W-006). */
export function VarianteForm({ inicial, digital, verCosto, mostrarCantidadInicial, formId, onEnviar }: VarianteFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const form = useForm<VarianteValues>({
    resolver: zodResolver(varianteSchema),
    defaultValues: {
      titulo: inicial?.titulo ?? "Predeterminada",
      sku: inicial?.sku ?? "",
      codigo_barras: inicial?.codigo_barras ?? "",
      precio: inicial ? String(inicial.precio) : "",
      precio_comparacion: inicial?.precio_comparacion != null ? String(inicial.precio_comparacion) : "",
      costo_unitario: inicial?.costo_unitario != null ? String(inicial.costo_unitario) : "",
      peso_gramos: inicial?.peso_gramos != null ? String(inicial.peso_gramos) : "",
      requiere_envio: digital ? false : (inicial?.requiere_envio ?? true),
      cantidad_inicial: "0",
      rastrea_inventario: inicial?.inventario.rastrea_inventario ?? true,
      permitir_venta_sin_stock: inicial?.inventario.permitir_venta_sin_stock ?? false,
    },
  })
  const requiereEnvio = useWatch({ control: form.control, name: "requiere_envio" })
  const rastrea = useWatch({ control: form.control, name: "rastrea_inventario" })
  const permitir = useWatch({ control: form.control, name: "permitir_venta_sin_stock" })

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const resultado = await onEnviar({ ...valores, requiere_envio: digital ? false : valores.requiere_envio })
    if (resultado.error) {
      const e = resultado.error
      // CAT-003 (SKU repetido) y CAT-004 (comparación ≤ precio) se pintan en su campo; el resto, en la alerta.
      if (e.codigo === "CAT-003") form.setError("sku", { message: e.message })
      else if (e.codigo === "CAT-004") form.setError("precio_comparacion", { message: e.message })
      for (const [campo, mensaje] of Object.entries(e.validaciones ?? {})) {
        form.setError(campo as keyof VarianteValues, { message: mensaje })
      }
      setError(e.codigo === "CAT-003" || e.codigo === "CAT-004" ? null : e)
    }
  })

  const estado = (campo: keyof VarianteValues) => (form.formState.errors[campo] ? "error" : "default") as "error" | "default"
  const mensaje = (campo: keyof VarianteValues) => form.formState.errors[campo]?.message

  return (
    <form id={formId} onSubmit={enviar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar la variante</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <FloatingInput label="Título de la variante" state={estado("titulo")} mensajeError={mensaje("titulo")} {...form.register("titulo")} />
      <FloatingInput
        label="SKU"
        state={estado("sku")}
        mensajeError={mensaje("sku")}
        ayuda="En mayúsculas, sin espacios. Debe ser único en la tienda."
        {...form.register("sku")}
        onChange={(e) => {
          e.target.value = normalizarSku(e.target.value)
          form.register("sku").onChange(e)
        }}
      />
      <FloatingInput label="Código de barras (opcional)" state={estado("codigo_barras")} mensajeError={mensaje("codigo_barras")} {...form.register("codigo_barras")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingInput label="Precio" inputMode="decimal" state={estado("precio")} mensajeError={mensaje("precio")} {...form.register("precio")} />
        <FloatingInput label="Precio de comparación (opcional)" inputMode="decimal" state={estado("precio_comparacion")} mensajeError={mensaje("precio_comparacion")} ayuda="Debe ser mayor que el precio." {...form.register("precio_comparacion")} />
        {verCosto && <FloatingInput label="Costo (opcional)" inputMode="decimal" state={estado("costo_unitario")} mensajeError={mensaje("costo_unitario")} {...form.register("costo_unitario")} />}
        <FloatingInput label="Peso en gramos (opcional)" inputMode="decimal" state={estado("peso_gramos")} mensajeError={mensaje("peso_gramos")} {...form.register("peso_gramos")} />
      </div>
      {mostrarCantidadInicial && (
        <FloatingInput label="Cantidad inicial en stock" inputMode="numeric" state={estado("cantidad_inicial")} mensajeError={mensaje("cantidad_inicial")} {...form.register("cantidad_inicial")} />
      )}
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 text-[13px]">
          <span>Requiere envío{digital ? " (no aplica a productos digitales)" : ""}</span>
          <Switch checked={!!requiereEnvio && !digital} disabled={digital} onCheckedChange={(v) => form.setValue("requiere_envio", v)} />
        </label>
        <label className="flex items-center justify-between gap-3 text-[13px]">
          <span>Controlar el inventario</span>
          <Switch checked={!!rastrea} onCheckedChange={(v) => form.setValue("rastrea_inventario", v)} />
        </label>
        <label className="flex items-center justify-between gap-3 text-[13px]">
          <span>Vender aunque no haya stock</span>
          <Switch checked={!!permitir} disabled={!rastrea} onCheckedChange={(v) => form.setValue("permitir_venta_sin_stock", v)} />
        </label>
      </div>
    </form>
  )
}

/** Payload de la API a partir de los valores del formulario. */
export function payloadVariante(valores: VarianteValues, crear: boolean): Record<string, unknown> {
  return {
    titulo: valores.titulo || undefined,
    sku: valores.sku,
    codigo_barras: valores.codigo_barras || undefined,
    precio: Number(valores.precio),
    precio_comparacion: numeroOpcional(valores.precio_comparacion),
    costo_unitario: numeroOpcional(valores.costo_unitario),
    peso_gramos: numeroOpcional(valores.peso_gramos),
    requiere_envio: valores.requiere_envio,
    rastrea_inventario: valores.rastrea_inventario,
    permitir_venta_sin_stock: valores.permitir_venta_sin_stock,
    ...(crear ? { cantidad_inicial: Number(valores.cantidad_inicial || 0) } : {}),
  }
}
