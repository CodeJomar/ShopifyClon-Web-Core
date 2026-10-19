"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { DashboardResumenDto } from "@/dtos/dashboard"
import { ESTADOS_PEDIDO } from "@/dtos/pedidos"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/cn"
import { ESTADO_PEDIDO_LABELS } from "../schema"
import { ESTADO_PEDIDO_CLASS, panelClass } from "./estilos"
import { PanelHeader } from "./panel-header"

/* -------------------------------------------------------------------------- */
/*                             Pedidos del periodo                            */
/* -------------------------------------------------------------------------- */

export function PedidosDelPeriodo({
  data,
  enlace,
  className,
}: {
  data: DashboardResumenDto
  enlace: boolean
  className?: string
}) {
  const { del_periodo: porEstado, activos } = data.pedidos
  const total = ESTADOS_PEDIDO.reduce((suma, estado) => suma + (porEstado[estado] ?? 0), 0)

  return (
    <section className={cn(panelClass, "flex flex-col gap-3 p-4 lg:p-5", className)}>
      <PanelHeader
        title="Pedidos del periodo"
        subtitle={`${total} ${total === 1 ? "pedido" : "pedidos"} · preparación promedio ${data.kpis.tiempo_promedio_preparacion_minutos} min`}
        action={
          enlace ? (
            <Link
              href="/transacciones/pedidos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C0107] hover:underline dark:text-[#E7B7BC]"
            >
              Ver todos <ChevronRight className="size-3.5" />
            </Link>
          ) : undefined
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ESTADOS_PEDIDO.map((estado) => (
          <li
            key={estado}
            className="flex flex-col items-start gap-2 rounded-xl border border-slate-100 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
          >
            <Badge variant="estado" className={ESTADO_PEDIDO_CLASS[estado]}>
              {ESTADO_PEDIDO_LABELS[estado]}
            </Badge>
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-stone-100">
              {porEstado[estado] ?? 0}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-auto border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-stone-800/80 dark:text-stone-400">
        Ahora mismo: {activos.pendientes} pendientes, {activos.en_preparacion} en preparación y{" "}
        {activos.listos_sin_cobrar} listos sin cobrar.
      </p>
    </section>
  )
}
