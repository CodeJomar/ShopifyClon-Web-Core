"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import type { ErrorApi } from "@/lib/api/error-api"
import type { StockVarianteDto } from "@/dtos/inventario"
import { ajustarStockAction } from "../actions/inventario.actions"
import { ajusteSchema, type AjusteValues } from "../schema"

interface AjustarStockFormProps {
  formId: string
  stock: StockVarianteDto
  /** Llamado con el stock nuevo tras guardar bien. */
  onGuardado: (stock: StockVarianteDto) => void
}

/** Ajuste manual: cantidad física nueva y motivo (INV-007). Los errores de la API van al campo o a la alerta. */
export function AjustarStockForm({ formId, stock, onGuardado }: AjustarStockFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const form = useForm<AjusteValues>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: { nueva_cantidad: String(stock.disponible), motivo: "" },
  })

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await ajustarStockAction(stock.variante_id, {
      nueva_cantidad: Number(valores.nueva_cantidad),
      motivo: valores.motivo,
    })
    if (!res.ok) {
      const e = res.error
      for (const [campo, mensaje] of Object.entries(e.validaciones ?? {})) {
        form.setError(campo as keyof AjusteValues, { message: mensaje })
      }
      setError(Object.keys(e.validaciones ?? {}).length > 0 ? null : e)
      return
    }
    onGuardado(res.datos)
  })

  const estado = (campo: keyof AjusteValues) => (form.formState.errors[campo] ? "error" : "default") as "error" | "default"
  const mensaje = (campo: keyof AjusteValues) => form.formState.errors[campo]?.message

  return (
    <form id={formId} onSubmit={enviar} noValidate className="space-y-5">
      <p className="text-[13px] text-muted-foreground">
        Disponible: {stock.disponible} · Reservado: {stock.reservada} · Vendible: {stock.vendible}
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos ajustar el stock</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <FloatingInput label="Cantidad física nueva" inputMode="numeric" state={estado("nueva_cantidad")} mensajeError={mensaje("nueva_cantidad")} {...form.register("nueva_cantidad")} />
      <FloatingInput label="Motivo del ajuste" state={estado("motivo")} mensajeError={mensaje("motivo")} {...form.register("motivo")} />
    </form>
  )
}
