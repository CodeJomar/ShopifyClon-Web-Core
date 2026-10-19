"use client"

import { History } from "lucide-react"

import type { TurnoListadoDto } from "@/dtos/caja"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { usePaginacionAjustada } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { aCentimos, formatearDinero } from "@/shared/utils/dinero"

import { RESULTADO_ARQUEO_LABELS, obtenerResultadoArqueo } from "../schema"
import { formatFechaHora } from "../utils"
import { RESULTADO_ARQUEO_CONFIG } from "./config-visual"
import { EncabezadoPanel } from "./encabezado-panel"
import { panelClass, textoSecundario, textoTitulo } from "./estilos"
import { ALTO_TURNO, UNA_COLUMNA } from "./medidas"
import { PanelVacio } from "./panel-vacio"

interface PanelTurnosProps {
  turnos: TurnoListadoDto[]
  titulo: string
  className?: string
}

/** Turnos anteriores (con cajero, arqueo y ventas), paginados según el alto disponible. */
export function PanelTurnos({ turnos, titulo, className }: PanelTurnosProps) {
  const paginacion = usePaginacionAjustada(turnos, { altoItem: ALTO_TURNO, anchoMinimo: UNA_COLUMNA, gap: 0 })

  return (
    <section className={cn(panelClass, "min-h-0 flex-col gap-3 overflow-hidden p-4", className)} aria-label={titulo}>
      <EncabezadoPanel titulo={titulo} detalle={`${turnos.length} turnos`} />
      {turnos.length === 0 ? (
        <PanelVacio icono={History} titulo="Sin turnos anteriores" texto="Los turnos cerrados aparecerán aquí." />
      ) : (
        <>
          <GrillaAjustada paginacion={paginacion} etiqueta={titulo}>
            {paginacion.visibles.map((turno) => (
              <li key={turno.id_turno_caja} className="min-h-0">
                <TurnoItem turno={turno} />
              </li>
            ))}
          </GrillaAjustada>
          <BarraPaginacion paginacion={paginacion} etiqueta="turnos" compacta />
        </>
      )}
    </section>
  )
}

function TurnoItem({ turno }: { turno: TurnoListadoDto }) {
  const resultado = turno.fecha_cierre ? obtenerResultadoArqueo(aCentimos(turno.diferencia)) : null
  const config = resultado ? RESULTADO_ARQUEO_CONFIG[resultado] : null

  return (
    <div className="flex h-full flex-col justify-center gap-0.5 border-b border-slate-100 text-xs dark:border-stone-800">
      <div className="flex items-center justify-between gap-2">
        <span className={cn("truncate text-sm font-bold", textoTitulo)}>{turno.id_turno_caja.slice(0, 8).toUpperCase()}</span>
        {resultado && config && (
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", config.badge)}>
            {RESULTADO_ARQUEO_LABELS[resultado]}
          </span>
        )}
      </div>
      <div className={cn("flex items-center justify-between gap-2", textoSecundario)}>
        <span className="truncate">{formatFechaHora(turno.fecha_apertura)}</span>
        <span className="truncate">Cajero: {turno.abierto_por}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={textoSecundario}>{turno.fecha_cierre ? `Contado ${formatearDinero(turno.monto_final_real)}` : "Abierto"}</span>
        <span className={cn("font-semibold tabular-nums", textoTitulo)}>Ventas {formatearDinero(turno.total_ventas)}</span>
      </div>
    </div>
  )
}
