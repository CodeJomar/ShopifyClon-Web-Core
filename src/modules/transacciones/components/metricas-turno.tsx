"use client"

import { cn } from "@/shared/utils/cn"
import { formatearCentimos, formatearDinero } from "@/shared/utils/dinero"
import { useTurnoCaja } from "../hooks/use-turno-caja"
import { MetricCard } from "./metric-card"

export function MetricasTurno({
  fondo,
  resumen,
  className,
}: {
  fondo: string
  resumen: NonNullable<ReturnType<typeof useTurnoCaja>["resumen"]>
  className?: string
}) {
  return (
    <div className={cn("grid-cols-2 content-start gap-2 sm:grid-cols-3 lg:gap-3 xl:grid-cols-5", className)}>
      <MetricCard label="Fondo Inicial" valor={formatearDinero(fondo)} sub="Efectivo de apertura" />
      <MetricCard
        label="Efectivo en Caja"
        valor={formatearCentimos(resumen.efectivoEsperado)}
        sub="Fondo + ventas + entradas − salidas"
        destacado
      />
      <MetricCard
        label="Ventas Efectivo"
        valor={formatearCentimos(resumen.ventasEfectivo)}
        sub={`${resumen.cuentasCobradas} cobros registrados`}
      />
      <MetricCard
        label="Digital / Tarjeta"
        valor={formatearCentimos(resumen.ventasTarjeta + resumen.ventasDigitales)}
        sub={`Tarj: ${formatearCentimos(resumen.ventasTarjeta)} · Dig: ${formatearCentimos(resumen.ventasDigitales)}`}
      />
      <MetricCard
        label="Entradas / Salidas"
        valor={`${formatearCentimos(resumen.ingresos)} / ${formatearCentimos(resumen.retiros)}`}
        sub={`Devoluciones: ${formatearCentimos(resumen.devoluciones)}`}
      />
    </div>
  )
}
