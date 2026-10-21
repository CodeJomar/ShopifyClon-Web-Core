"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Switch } from "@/shared/components/ui/switch"
import type { ErrorApi } from "@/lib/api/error-api"
import type { StockVarianteDto } from "@/dtos/inventario"
import { configurarStockAction } from "../actions/inventario.actions"

interface ConfigurarStockFormProps {
  formId: string
  stock: StockVarianteDto
  onGuardado: (stock: StockVarianteDto) => void
}

/** Interruptores de rastreo y venta sin stock de una variante. */
export function ConfigurarStockForm({ formId, stock, onGuardado }: ConfigurarStockFormProps) {
  const [rastrea, setRastrea] = React.useState(stock.rastrea_inventario)
  const [permitir, setPermitir] = React.useState(stock.permitir_venta_sin_stock)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setError(null)
    const res = await configurarStockAction(stock.variante_id, { rastrea_inventario: rastrea, permitir_venta_sin_stock: permitir })
    if (!res.ok) return setError(res.error)
    onGuardado(res.datos)
  }

  return (
    <form id={formId} onSubmit={enviar} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar la configuración</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <label className="flex items-center justify-between gap-3 text-[13px]">
        <span>Controlar el inventario</span>
        <Switch checked={rastrea} onCheckedChange={(v) => setRastrea(v)} />
      </label>
      <label className="flex items-center justify-between gap-3 text-[13px]">
        <span>Vender aunque no haya stock</span>
        <Switch checked={permitir} disabled={!rastrea} onCheckedChange={(v) => setPermitir(v)} />
      </label>
    </form>
  )
}
