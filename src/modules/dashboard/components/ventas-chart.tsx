"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { SerieVentasDto } from "@/dtos/dashboard"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { cn } from "@/shared/utils/cn"
import { formatToCurrency } from "@/shared/utils/formatters"

import { etiquetaTramo } from "../utils"
import { ventasChartConfig } from "./config-grafico"
import { panelClass } from "./estilos"
import { PanelHeader } from "./panel-header"

const TITULO_POR_GRANULARIDAD = {
  hour: "Ventas por hora",
  day: "Ventas por día",
  week: "Ventas por semana",
} as const

interface VentasChartProps {
  serie: SerieVentasDto
  subtitulo: string
  className?: string
}

/** Ventas netas (cobros menos devoluciones) por hora, día o semana según el periodo consultado. */
export function VentasChart({ serie, subtitulo, className }: VentasChartProps) {
  const datos = serie.tramos.map((t) => ({
    tramo: etiquetaTramo(t.tramo, serie.granularidad),
    ventas: Number(t.ventas),
    pedidos: t.pedidos,
  }))
  const sinVentas = datos.every((d) => d.ventas === 0)

  return (
    <section className={cn(panelClass, "flex flex-col gap-3 p-4 lg:p-5", className)}>
      <PanelHeader title={TITULO_POR_GRANULARIDAD[serie.granularidad]} subtitle={subtitulo} />

      {sinVentas ? (
        <p className="py-14 text-center text-xs text-slate-500 dark:text-stone-400">Aún no hay ventas en este periodo.</p>
      ) : (
        <ChartContainer config={ventasChartConfig} className="aspect-auto h-52 w-full sm:h-56">
          <AreaChart data={datos} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ventas)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-ventas)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="tramo" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(valor: number) => `S/ ${valor}`} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(valor, nombre) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {ventasChartConfig[nombre as keyof typeof ventasChartConfig]?.label ?? nombre}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {nombre === "ventas" ? formatToCurrency(Number(valor)) : valor}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area dataKey="ventas" type="monotone" fill="url(#fillVentas)" stroke="var(--color-ventas)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      )}
    </section>
  )
}
