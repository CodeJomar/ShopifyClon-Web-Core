"use client"

import { useCan } from "@/modules/auth"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ACCION, MODULO } from "@/shared/constants/permisos"
import { cn } from "@/shared/utils/cn"
import { PERIODO_LABELS, periodoDashboardSchema } from "../schema"
import { useDashboard } from "../hooks/use-dashboard"
import { IndicadorEnVivo } from "../components/indicador-en-vivo"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { DashboardSkeleton } from "../components/dashboard-skeleton"
import { armarKpis } from "../utils"
import { KpiCard } from "../components/kpi-card"
import { DistribucionPagos } from "../components/distribucion-pagos"
import { CajaResumen } from "../components/caja-resumen"
import { PedidosDelPeriodo } from "../components/pedidos-del-periodo"
import { ProductosTop } from "../components/productos-top"
import { PedidosRecientes } from "../components/pedidos-recientes"
import { VentasChart } from "../components/ventas-chart"

export function DashboardView() {
  const { periodo, cambiarPeriodo, data, actualizadoEn, isLoading, isRefreshing, error, recargar } = useDashboard()
  const { puede } = useCan()
  const puedeVerTransacciones = puede({ modulo: MODULO.TRANSACTIONS, accion: ACCION.LEER })

  return (
    <div className="flex flex-col gap-6 pb-2">
      {/* Header del módulo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-stone-100">
            Panel de control
          </h1>
          <IndicadorEnVivo actualizadoEn={actualizadoEn ?? undefined} isRefreshing={isRefreshing} />
        </div>

        <Tabs
          value={periodo}
          onValueChange={(value) => {
            const parsed = periodoDashboardSchema.safeParse(value)
            if (parsed.success) cambiarPeriodo(parsed.data)
          }}
          className="w-auto"
        >
          <TabsList className="h-9 p-1 border-none shadow-none bg-[#EDE5E6]/50 dark:bg-stone-800">
            {periodoDashboardSchema.options.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="h-7 px-4 text-xs text-slate-600 dark:text-stone-300"
              >
                {PERIODO_LABELS[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {error && !data ? (
        <EstadoError mensaje={error} onReintentar={recargar} />
      ) : !data ? (
        <DashboardSkeleton />
      ) : (
        <div
          className={cn(
            "grid grid-cols-12 gap-4 lg:gap-5 transition-opacity",
            isLoading && "opacity-60 pointer-events-none"
          )}
          aria-busy={isLoading}
        >
          {/* Fila 1: KPIs principales (4 métricas x 3 columnas = 12 cols) */}
          {armarKpis(data).map((kpi) => (
            <div key={kpi.id} className="col-span-12 sm:col-span-6 xl:col-span-3">
              <KpiCard kpi={kpi} />
            </div>
          ))}

          {/* Fila 2: Ventas por tramo (8 cols) + Estado de caja (4 cols) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col">
            <VentasChart serie={data.serie_ventas} subtitulo={`Periodo: ${PERIODO_LABELS[periodo]}`} className="h-full" />
          </div>
          <div className="col-span-12 xl:col-span-4 flex flex-col">
            <CajaResumen caja={data.caja_actual} enlace={puedeVerTransacciones} className="h-full" />
          </div>

          {/* Fila 3: Pedidos recientes (8 cols) + Top productos (4 cols) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col">
            <PedidosRecientes pedidos={data.pedidos_recientes} enlace={puedeVerTransacciones} className="h-full" />
          </div>
          <div className="col-span-12 xl:col-span-4 flex flex-col">
            <ProductosTop productos={data.top_productos} className="h-full" />
          </div>

          {/* Fila 4: Ventas por método de pago + Pedidos del periodo por estado */}
          <div className="col-span-12 xl:col-span-6 flex flex-col">
            <DistribucionPagos data={data} periodo={periodo} className="h-full" />
          </div>
          <div className="col-span-12 xl:col-span-6 flex flex-col">
            <PedidosDelPeriodo data={data} enlace={puedeVerTransacciones} className="h-full" />
          </div>
        </div>
      )}
    </div>
  )
}
