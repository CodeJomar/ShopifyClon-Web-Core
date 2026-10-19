"use client"

import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { usePaginacionAjustada } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { ESTADO_MESA_CONFIG, getAreaConfig } from "@/shared/utils/mesa-visual"

import { FILTRO_TODAS_LAS_AREAS, type MesaPos } from "../schema"
import { opcionClass, panelClass } from "./estilos"
import { MesaCard } from "./mesa-card"

interface MesasPanelProps {
  /** Título del POS y selector de vista, que van arriba del mapa. */
  encabezado: React.ReactNode
  mesas: MesaPos[]
  areas: string[]
  areaFiltro: string
  onCambiarArea: (area: string) => void
  mesaSeleccionadaId: string | null
  /** Instante actual (se refresca cada 30 s) para calcular los minutos de ocupación. */
  ahora: number
  isLoading: boolean
  puedeLiberar: boolean
  onSeleccionar: (mesa: MesaPos) => void
  onLiberar: (idMesa: string) => Promise<boolean>
}

// Alto fijo de cada tarjeta de mesa
const ALTO_MESA = 132

const ESTADOS_LEYENDA = ["libre", "ocupada", "por_cobrar", "por_limpiar"] as const

/** Mapa de mesas del local: leyenda de estados, filtro por área y cuadrícula de mesas con paginación. */
export function MesasPanel({
  encabezado,
  mesas,
  areas,
  areaFiltro,
  onCambiarArea,
  mesaSeleccionadaId,
  ahora,
  isLoading,
  puedeLiberar,
  onSeleccionar,
  onLiberar,
}: MesasPanelProps) {
  const paginacion = usePaginacionAjustada(mesas, { altoItem: ALTO_MESA, anchoMinimo: 180, gap: 12, clave: areaFiltro })

  return (
    <section className={cn(panelClass, "flex h-full min-h-0 min-w-0 flex-col gap-3.5 p-4 lg:p-5")} aria-label="Mapa de mesas y áreas físicas">
      {encabezado}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-stone-100">Mapa de Mesas</h2>
          <p className="text-xs text-slate-500 dark:text-stone-400">Selecciona una mesa para asociar la comanda actual.</p>
        </div>

        {/* Leyenda de estados */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {ESTADOS_LEYENDA.map((estado) => {
            const conf = ESTADO_MESA_CONFIG[estado]
            return (
              <span key={estado} className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-stone-300">
                <span className={cn("size-2 rounded-full", conf.dot)} />
                {conf.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Filtro por área del local */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => onCambiarArea(FILTRO_TODAS_LAS_AREAS)}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
            opcionClass(areaFiltro === FILTRO_TODAS_LAS_AREAS),
          )}
        >
          Todas las áreas
        </button>
        {areas.map((area) => {
          const config = getAreaConfig(area)
          return (
            <button
              key={area}
              type="button"
              onClick={() => onCambiarArea(area)}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                opcionClass(areaFiltro === area),
              )}
            >
              <config.icon className="size-3.5" />
              {area}
            </button>
          )
        })}
      </div>

      {!isLoading && (
        <>
          <GrillaAjustada paginacion={paginacion} etiqueta="Mesas">
            {paginacion.visibles.map((m) => (
              <li key={m.id_mesa} className="min-h-0">
                <MesaCard
                  mesa={m}
                  seleccionada={mesaSeleccionadaId === m.id_mesa}
                  ahora={ahora}
                  puedeLiberar={puedeLiberar}
                  onSeleccionar={onSeleccionar}
                  onLiberar={onLiberar}
                />
              </li>
            ))}
          </GrillaAjustada>
          <BarraPaginacion paginacion={paginacion} etiqueta="mesas" />
        </>
      )}
    </section>
  )
}
