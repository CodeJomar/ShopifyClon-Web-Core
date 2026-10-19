"use client"

import Link from "next/link"
import { ChevronRight, Wallet } from "lucide-react"
import type { DashboardResumenDto } from "@/dtos/dashboard"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/cn"
import { formatToCurrency } from "@/shared/utils/formatters"
import { panelClass } from "./estilos"
import { PanelHeader } from "./panel-header"

/* -------------------------------------------------------------------------- */
/*                                   Caja                                     */
/* -------------------------------------------------------------------------- */

export function CajaResumen({
  caja,
  enlace,
  className,
}: {
  caja: DashboardResumenDto["caja_actual"]
  enlace: boolean
  className?: string
}) {
  const abierta = caja?.abierta === true

  return (
    <section className={cn(panelClass, "flex flex-col gap-3 p-4 lg:p-5", className)}>
      <PanelHeader
        title="Estado de caja"
        subtitle={caja?.abierta ? `Apertura ${caja.desde} · ${caja.abierta_por}` : undefined}
        action={
          caja ? (
            <Badge
              variant="estado"
              className={cn(
                abierta
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-300"
              )}
            >
              {abierta ? "Abierta" : "Cerrada"}
            </Badge>
          ) : undefined
        }
      />

      {!caja ? (
        <p className="py-6 text-center text-xs text-slate-500 dark:text-stone-400">
          Tu cargo no tiene acceso al detalle de caja.
        </p>
      ) : !caja.abierta ? (
        <p className="py-6 text-center text-xs text-slate-500 dark:text-stone-400">No hay un turno de caja abierto.</p>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-[#4C0107] p-3 text-white dark:bg-stone-800">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <Wallet className="size-4.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-white/75 dark:text-stone-400">Efectivo esperado en caja</span>
              <span className="text-xl font-bold tabular-nums dark:text-stone-100">
                {formatToCurrency(caja.efectivo_esperado)}
              </span>
            </div>
          </div>

          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-stone-800">
            <li className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-600 dark:text-stone-400">Monto inicial</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-stone-100">
                {formatToCurrency(caja.monto_inicial)}
              </span>
            </li>
            <li className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-600 dark:text-stone-400">Ventas en efectivo</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-stone-100">
                {formatToCurrency(caja.ventas_efectivo)}
              </span>
            </li>
            <li className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-600 dark:text-stone-400">Ventas digitales y tarjeta</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-stone-100">
                {formatToCurrency(caja.ventas_digitales)}
              </span>
            </li>
          </ul>
        </>
      )}

      {enlace && (
        <Link
          href="/transacciones/cajas"
          className="mt-auto inline-flex items-center gap-1 self-start pt-1 text-xs font-semibold text-[#4C0107] hover:underline dark:text-[#E7B7BC]"
        >
          Gestionar cajas <ChevronRight className="size-3.5" />
        </Link>
      )}
    </section>
  )
}
