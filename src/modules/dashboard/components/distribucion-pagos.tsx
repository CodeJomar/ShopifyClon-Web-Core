"use client"

import type { DashboardResumenDto } from "@/dtos/dashboard"
import { cn } from "@/shared/utils/cn"
import { formatToCurrency } from "@/shared/utils/formatters"
import { METODO_PAGO_LABELS, type PeriodoDashboard } from "../schema"
import { panelClass } from "./estilos"
import { PanelHeader } from "./panel-header"

const DETALLE_PERIODO: Record<PeriodoDashboard, string> = {
  hoy: "Hoy",
  semana: "Últimos 7 días",
  mes: "Últimos 30 días",
}

/* -------------------------------------------------------------------------- */
/*                            Distribución de pagos                           */
/* -------------------------------------------------------------------------- */

export function DistribucionPagos({
  data,
  periodo,
  className,
}: {
  data: DashboardResumenDto
  periodo: PeriodoDashboard
  className?: string
}) {
  const pagos = data.distribucion_pagos

  return (
    <section className={cn(panelClass, "flex flex-col gap-3 p-4 lg:p-5", className)}>
      <PanelHeader title="Ventas por método de pago" subtitle={`Periodo: ${DETALLE_PERIODO[periodo]}`} />

      {pagos.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500 dark:text-stone-400">
          Aún no hay cobros en este periodo.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pagos.map((pago) => (
            <li key={pago.metodo} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-900 dark:text-stone-100">
                  {METODO_PAGO_LABELS[pago.metodo]}
                  <span className="ml-2 font-normal text-slate-500 dark:text-stone-400">
                    {pago.cobros} {pago.cobros === 1 ? "cobro" : "cobros"}
                  </span>
                </span>
                <span className="tabular-nums text-slate-700 dark:text-stone-200">
                  {formatToCurrency(pago.monto)} · {pago.porcentaje}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-[#4C0107] transition-all dark:bg-[#E7B7BC]"
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(pago.porcentaje) || 0))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
