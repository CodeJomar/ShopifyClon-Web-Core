"use client"

import * as React from "react"
import { SearchX } from "lucide-react"
import { usePaginacionAjustada } from "@/shared/hooks"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { SearchInput } from "@/shared/components/composed/search-input"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { cn } from "@/shared/utils/cn"
import { formatearCentimos, formatearDinero } from "@/shared/utils/dinero"
import { numeroPedido } from "../schema"
import { GRUPO_PEDIDO_LABELS, PERIODO_PEDIDOS_LABELS, type FiltroGrupoPedido, type PeriodoPedidos } from "../schema"
import { devolverCobro } from "../actions/transacciones.actions"
import { toastResponse } from "@/shared/utils/toast-response"
import { useHistorialPedidos } from "../hooks/use-historial-pedidos"
import { useComprobante } from "../hooks/use-comprobante"
import { useAnularPedido } from "../hooks/use-anular-pedido"
import { type CobroDevolvible, ComprobanteModal } from "./comprobante-modal"
import { ALTO_PEDIDO, UNA_COLUMNA } from "./medidas"
import { TransaccionesSkeleton } from "./transacciones-skeleton"
import { MetricCard } from "./metric-card"
import { opcionClass, panelClass } from "./estilos"
import { GRUPO_PEDIDO_CHIPS } from "./config-visual"
import { FilaPedido } from "./fila-pedido"
import { lugarDe } from "../utils"
import { DevolucionForm } from "./devolucion-form"
import { AnularPedidoForm } from "./anular-pedido-form"

/* -------------------------------------------------------------------------- */
/*                            Historial de pedidos                            */
/* -------------------------------------------------------------------------- */

// Columnas de la lista: en tablet se muestran las esenciales y en escritorio amplio, todas
export const columnasPedido =
  "md:grid md:items-center md:gap-3 md:grid-cols-[84px_minmax(0,1fr)_118px_88px_100px_96px] xl:grid-cols-[84px_minmax(0,1fr)_124px_70px_100px_150px_120px]"

export function SeccionHistorialPedidos({ puedeDevolver, puedeAnular }: { puedeDevolver: boolean; puedeAnular: boolean }) {
  const {
    pedidosFiltrados,
    conteo,
    cobradoCentimos,
    porCobrarCentimos,
    periodo,
    setPeriodo,
    busqueda,
    setBusqueda,
    grupo,
    setGrupo,
    isLoading,
    error,
    recargar,
  } = useHistorialPedidos()
  const { comprobante, eventos, reimprimiendo, consultar, actualizar, reimprimir, cerrar: cerrarComprobante } = useComprobante()
  const anular = useAnularPedido()

  const [cobroADevolver, setCobroADevolver] = React.useState<CobroDevolvible | null>(null)
  const [pedidoAAnular, setPedidoAAnular] = React.useState<{ id: string; numero: string; detalle: string } | null>(null)

  // Lista de una sola columna; al cambiar búsqueda o filtros se vuelve a la primera página
  const paginacion = usePaginacionAjustada(pedidosFiltrados, {
    altoItem: ALTO_PEDIDO,
    anchoMinimo: UNA_COLUMNA,
    gap: 0,
    clave: `${busqueda}|${grupo}|${periodo}`,
  })

  if (isLoading) return <TransaccionesSkeleton />
  if (error) return <EstadoError mensaje={error} onReintentar={recargar} />

  const total = conteo.activo + conteo.pagado + conteo.anulado

  const devolver = async (payload: { id_transaccion_origen: string; monto: string; motivo: string }, clave: string) => {
    const respuesta = await toastResponse(devolverCobro(payload, clave), {
      loading: "Registrando la devolución…",
      success: "Devolución registrada",
      error: "No se pudo registrar la devolución",
    })
    if (respuesta.isOk()) {
      if (comprobante) await actualizar(comprobante.id_pedido)
      recargar()
    }
    return respuesta.isOk()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {/* Resumen del periodo */}
      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
        <MetricCard label="Pedidos" valor={String(total)} sub={PERIODO_PEDIDOS_LABELS[periodo]} />
        <MetricCard label="Cobrado" valor={formatearCentimos(cobradoCentimos)} sub={`${conteo.pagado} pagados`} />
        <MetricCard label="Por cobrar" valor={formatearCentimos(porCobrarCentimos)} sub={`${conteo.activo} en curso`} destacado />
        <MetricCard label="Anulados" valor={String(conteo.anulado)} sub="Quedan registrados" />
      </div>

      <section
        className={cn(panelClass, "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4")}
        aria-label="Historial de pedidos"
      >
        <div className="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          {/* Buscador */}
          <SearchInput
            id="historial-buscar-pedido"
            value={busqueda}
            onValueChange={setBusqueda}
            placeholder="Buscar por cliente, mesa o #número…"
            className="min-w-0 flex-1"
          />

          <div className="flex shrink-0 flex-wrap gap-1.5">
            {/* Periodo consultado a la API */}
            {(Object.keys(PERIODO_PEDIDOS_LABELS) as PeriodoPedidos[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodo(p)}
                aria-pressed={periodo === p}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-semibold whitespace-nowrap transition-colors",
                  opcionClass(periodo === p)
                )}
              >
                {PERIODO_PEDIDOS_LABELS[p]}
              </button>
            ))}
            <span className="mx-1 hidden w-px self-stretch bg-slate-200 lg:block dark:bg-stone-700" />
            {/* Filtro por estado */}
            {GRUPO_PEDIDO_CHIPS.map((g: FiltroGrupoPedido) => {
              const activo = grupo === g
              const cantidad = g === "todos" ? total : conteo[g]
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrupo(g)}
                  aria-pressed={activo}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold whitespace-nowrap transition-colors",
                    opcionClass(activo)
                  )}
                >
                  <span>{g === "todos" ? "Todos" : GRUPO_PEDIDO_LABELS[g]}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] tabular-nums",
                      activo
                        ? "bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900"
                        : "bg-slate-100 text-slate-600 dark:bg-stone-800 dark:text-stone-300"
                    )}
                  >
                    {cantidad}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <EstadoVacio
            icono={SearchX}
            titulo="No se encontraron pedidos"
            descripcion="Prueba con otro periodo, filtro o término de búsqueda."
            className="min-h-0"
          />
        ) : (
          <>
            {/* Encabezado de columnas (tablet y escritorio) */}
            <div
              className={cn(
                "hidden shrink-0 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-500 dark:border-stone-800 dark:text-stone-400",
                columnasPedido
              )}
            >
              <span>Pedido</span>
              <span>Lugar</span>
              <span>Fecha / Hora</span>
              <span className="hidden xl:block">Items</span>
              <span className="text-right">Total</span>
              <span className="text-center">Estado</span>
              <span className="text-right">Acciones</span>
            </div>

            <GrillaAjustada paginacion={paginacion} etiqueta="Pedidos del historial">
              {paginacion.visibles.map((pedido) => (
                <li key={pedido.id_pedido} className="min-h-0">
                  <FilaPedido
                    pedido={pedido}
                    puedeAnular={puedeAnular}
                    onVerDetalle={() => void consultar(pedido.id_pedido)}
                    onAnular={() =>
                      setPedidoAAnular({
                        id: pedido.id_pedido,
                        numero: numeroPedido(pedido.correlativo),
                        detalle: `${lugarDe(pedido)} · ${formatearDinero(pedido.total_calculado)}`,
                      })
                    }
                  />
                </li>
              ))}
            </GrillaAjustada>
            <BarraPaginacion paginacion={paginacion} etiqueta="pedidos" />
          </>
        )}
      </section>

      {comprobante && (
        <ComprobanteModal
          comprobante={comprobante}
          eventos={eventos}
          puedeDevolver={puedeDevolver}
          puedeAnular={puedeAnular}
          reimprimiendo={reimprimiendo}
          onClose={cerrarComprobante}
          onDevolver={setCobroADevolver}
          onReimprimir={() => void reimprimir(comprobante.id_pedido)}
          onAnular={() => {
            setPedidoAAnular({
              id: comprobante.id_pedido,
              numero: numeroPedido(comprobante.correlativo),
              detalle: `${numeroPedido(comprobante.correlativo)} · ${formatearDinero(comprobante.total)}`,
            })
          }}
        />
      )}

      {comprobante && cobroADevolver && (
        <DevolucionForm
          cobro={cobroADevolver}
          numero={numeroPedido(comprobante.correlativo)}
          onClose={() => setCobroADevolver(null)}
          onDevolver={devolver}
        />
      )}

      {pedidoAAnular && (
        <AnularPedidoForm
          idPedido={pedidoAAnular.id}
          numero={pedidoAAnular.numero}
          detalle={pedidoAAnular.detalle}
          onClose={() => setPedidoAAnular(null)}
          onAnular={async (id, motivo) => {
            const respuesta = await anular(id, motivo)
            if (respuesta.isOk()) {
              cerrarComprobante()
              recargar()
            }
            return respuesta.isOk()
          }}
        />
      )}
    </div>
  )
}
