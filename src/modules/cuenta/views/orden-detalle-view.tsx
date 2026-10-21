"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { ordenCuentaAction } from "../actions/cuenta.actions"
import { ETIQUETA_PAGO, ETIQUETA_PREPARACION, etiquetaDe } from "../utils-orden"
import type { OrdenDetalleDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

/** Texto legible de una dirección guardada en la orden (la API la devuelve como objeto libre). TODO(Q-W-005). */
const textoDireccion = (direccion?: Record<string, unknown> | null) => {
  if (!direccion) return "Sin dirección registrada"
  const partes = Object.values(direccion).filter((valor): valor is string => typeof valor === "string" && valor.trim() !== "")
  return partes.length ? partes.join(", ") : "Sin dirección registrada"
}

export function OrdenDetalleView({ id }: { id: string }) {
  const [orden, setOrden] = React.useState<OrdenDetalleDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    ordenCuentaAction(id).then((res) => {
      if (cancelado) return
      if (res.ok) setOrden(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [id])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cuenta/ordenes" className="text-[12px] font-bold text-brand-text hover:underline">
          ← Mis órdenes
        </Link>
        <h1 className="mt-1 text-[18px] font-extrabold tracking-tight text-foreground">
          {orden ? `Orden ${orden.numero_orden}` : "Orden"}
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No encontramos esta orden</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!orden && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando la orden…
        </p>
      )}

      {orden && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orden.items.map((item, indice) => (
                <div key={`${item.sku ?? item.titulo_producto}-${indice}`} className="flex items-start justify-between gap-3 border-b border-island-border pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{item.titulo_producto}</p>
                    {item.titulo_variante && <p className="text-[12.5px] text-muted-foreground">{item.titulo_variante}</p>}
                    <p className="text-[12.5px] text-muted-foreground">
                      {item.cantidad} × {formatearDinero(Number(item.precio_unitario), orden.moneda)}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-foreground">{formatearDinero(Number(item.total_linea), orden.moneda)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              <div className="flex flex-wrap gap-2">
                <Badge variant="estado" tono={etiquetaDe(ETIQUETA_PAGO, orden.estado_pago).tono}>{etiquetaDe(ETIQUETA_PAGO, orden.estado_pago).texto}</Badge>
                <Badge variant="estado" tono={etiquetaDe(ETIQUETA_PREPARACION, orden.estado_preparacion).tono}>{etiquetaDe(ETIQUETA_PREPARACION, orden.estado_preparacion).texto}</Badge>
              </div>
              <p className="text-muted-foreground">Hecha el {formatearFecha(orden.fecha_creacion)}</p>
              <div className="space-y-1 text-muted-foreground">
                <p className="flex justify-between"><span>Subtotal</span><span>{formatearDinero(Number(orden.subtotal), orden.moneda)}</span></p>
                <p className="flex justify-between"><span>Descuento</span><span>{formatearDinero(Number(orden.descuento_total), orden.moneda)}</span></p>
                <p className="flex justify-between"><span>Envío</span><span>{formatearDinero(Number(orden.costo_envio), orden.moneda)}</span></p>
                <p className="flex justify-between"><span>Impuestos</span><span>{formatearDinero(Number(orden.impuestos_total), orden.moneda)}</span></p>
              </div>
              <p className="flex justify-between border-t border-island-border pt-3 text-[15px] font-extrabold text-foreground">
                <span>Total</span>
                <span>{formatearDinero(Number(orden.total), orden.moneda)}</span>
              </p>
              <div className="border-t border-island-border pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Envío a</p>
                <p className="mt-1 text-muted-foreground">{textoDireccion(orden.direccion_envio)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
