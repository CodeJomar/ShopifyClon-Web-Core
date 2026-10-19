"use client"

import type { DashboardResumenDto } from "@/dtos/dashboard"
import { cn } from "@/shared/utils/cn"
import { formatToCurrency } from "@/shared/utils/formatters"
import { panelClass } from "./estilos"
import { PanelHeader } from "./panel-header"

/* -------------------------------------------------------------------------- */
/*                           Productos más vendidos                           */
/* -------------------------------------------------------------------------- */

const PRODUCTOS_POR_PAGINA = 5

export function ProductosTop({
  productos,
  className,
}: {
  productos: DashboardResumenDto["top_productos"]
  className?: string
}) {
  const visibles = productos.slice(0, PRODUCTOS_POR_PAGINA)
  const maxUnidades = Math.max(...visibles.map((p) => p.unidades_vendidas), 1)

  return (
    <section className={cn(panelClass, "flex flex-col gap-3 p-4 lg:p-5", className)}>
      <PanelHeader title="Más vendidos" subtitle="Ranking de ventas" />

      {visibles.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500 dark:text-stone-400">Aún no hay ventas en este periodo.</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {visibles.map((producto, index) => (
            <li key={producto.id_producto} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EDE5E6] text-[11px] font-bold text-[#4C0107] dark:bg-stone-800 dark:text-stone-200">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-slate-900 dark:text-stone-100">{producto.nombre}</span>
                    {producto.categoria && (
                      <span className="truncate text-[10px] text-slate-500 dark:text-stone-400">{producto.categoria}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-xs font-semibold tabular-nums text-slate-900 dark:text-stone-100">
                    {producto.unidades_vendidas} u.
                  </span>
                  <span className="text-[10px] tabular-nums text-slate-500 dark:text-stone-400">
                    {formatToCurrency(producto.total_recaudado)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-[#4C0107] transition-all dark:bg-[#E7B7BC]"
                  style={{ width: `${(producto.unidades_vendidas / maxUnidades) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
