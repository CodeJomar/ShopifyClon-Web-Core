"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, ClipboardList, Coins, Grid2X2, ReceiptText } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { type DashboardKpi, type TipoKpi } from "../schema"
import { panelClass } from "./estilos"

const KPI_ICONS: Record<TipoKpi, React.ReactNode> = {
  ventas: <Coins className="size-4" />,
  pedidos: <ClipboardList className="size-4" />,
  mesas: <Grid2X2 className="size-4" />,
  ticket: <ReceiptText className="size-4" />,
}

/* -------------------------------------------------------------------------- */
/*                                   KPIs                                     */
/* -------------------------------------------------------------------------- */

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const destacado = kpi.id === "pedidos"

  return (
    <div className={cn(panelClass, "flex h-28 flex-col justify-between p-3.5")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400">
          {kpi.titulo}
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-stone-200">
          {KPI_ICONS[kpi.id]}
        </span>
      </div>

      <span
        className={cn(
          "text-2xl sm:text-3xl font-bold tracking-tight tabular-nums",
          destacado ? "text-[#4C0107] dark:text-[#E7B7BC]" : "text-slate-900 dark:text-stone-100"
        )}
      >
        {kpi.valor}
      </span>

      <div className="flex items-center gap-1.5 text-xs">
        {kpi.variacion !== undefined && kpi.variacion !== null && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 font-semibold",
              kpi.variacion >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
            title="Frente al periodo anterior"
          >
            {kpi.variacion >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(kpi.variacion).toFixed(1)}%
          </span>
        )}
        <span className="truncate text-slate-500 dark:text-stone-400">{kpi.detalle}</span>
      </div>
    </div>
  )
}
