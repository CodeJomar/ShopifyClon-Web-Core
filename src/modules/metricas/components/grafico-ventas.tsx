"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/shared/components/ui/chart"
import { formatearDinero } from "@/shared/utils/dinero"
import type { DiaMetricasDto } from "@/dtos/metricas"

const configuracion = {
  ventas_netas: { label: "Ventas netas", color: "var(--chart-1)" },
} satisfies ChartConfig

/** Ventas netas por día del rango. Colores de los tokens `--chart-*`, sin colores sueltos. */
export function GraficoVentas({ dias, moneda }: { dias: DiaMetricasDto[]; moneda: string }) {
  const datos = dias.map((dia) => ({
    fecha: new Date(`${dia.fecha}T12:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
    ventas_netas: dia.ventas_netas,
  }))

  return (
    <ChartContainer config={configuracion} className="h-[240px] w-full">
      <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="fecha" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
        <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={(valor: number) => formatearDinero(valor, moneda)} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(valor) => formatearDinero(Number(valor), moneda)} />} />
        <Bar dataKey="ventas_netas" fill="var(--color-ventas_netas)" radius={6} />
      </BarChart>
    </ChartContainer>
  )
}
