"use client"

import * as React from "react"
import { ArrowLeftRight, LockKeyhole, LockKeyholeOpen } from "lucide-react"
import type { TipoMovimientoManual } from "@/dtos/caja"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { useTurnoCaja } from "../hooks/use-turno-caja"
import { type PanelCaja, SelectorPaneles } from "./selector-paneles"
import { TransaccionesSkeleton } from "./transacciones-skeleton"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { AperturaCajaForm } from "./apertura-caja-form"
import { PanelTurnos } from "./panel-turnos"
import { tarjetaClass, textoSecundario, textoTitulo } from "./estilos"
import { formatHora, formatTranscurrido } from "../utils"
import { MetricasTurno } from "./metricas-turno"
import { PanelMovimientos } from "./panel-movimientos"
import { MovimientoCajaForm } from "./movimiento-caja-form"
import { CierreCajaForm } from "./cierre-caja-form"

/* -------------------------------------------------------------------------- */
/*                         Turno de caja (apertura y cierre)                  */
/* -------------------------------------------------------------------------- */

export function SeccionCajas({ puedeAbrirCerrar, puedeMover }: { puedeAbrirCerrar: boolean; puedeMover: boolean }) {
  const { actual, resumen, movimientos, archivados, isLoading, error, recargar, abrir, registrar, cerrar } = useTurnoCaja()
  const [panel, setPanel] = React.useState<PanelCaja>("principal")
  const [modalMovimiento, setModalMovimiento] = React.useState<TipoMovimientoManual | null>(null)
  const [modalCierre, setModalCierre] = React.useState(false)

  if (isLoading) return <TransaccionesSkeleton />
  if (error) return <EstadoError mensaje={error} onReintentar={recargar} />

  // En móvil/tablet solo se muestra el panel elegido; en escritorio (xl) se muestran todos
  const visibilidad = (id: PanelCaja) => (panel === id ? "flex" : "hidden xl:flex")

  /* Sin turno activo: formulario de apertura + turnos anteriores */
  if (!actual || !resumen) {
    const activo = panel === "movimientos" ? "principal" : panel
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <SelectorPaneles
          opciones={[
            { id: "principal", label: "Apertura" },
            { id: "turnos", label: "Turnos anteriores", total: archivados.length },
          ]}
          activo={activo}
          onChange={setPanel}
        />
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className={cn("min-h-0 flex-col", activo === "principal" ? "flex" : "hidden xl:flex")}>
            <AperturaCajaForm
              ultimoTurno={archivados[0]}
              puedeAbrir={puedeAbrirCerrar}
              onAbrir={async (monto, nota) => (await abrir({ monto_inicial: monto, ...(nota ? { nota_apertura: nota } : {}) })).isOk()}
            />
          </div>
          <PanelTurnos turnos={archivados} titulo="Turnos anteriores" className={visibilidad("turnos")} />
        </div>
      </div>
    )
  }

  const { turno } = actual

  /* Turno abierto: estado, acciones y métricas + movimientos + turnos anteriores */
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className={cn(tarjetaClass, "flex shrink-0 flex-col gap-4 p-4 xl:gap-5 xl:p-5")}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 sm:size-12 dark:bg-emerald-500/20 dark:text-emerald-300">
              <LockKeyholeOpen className="size-5 sm:size-6" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className={cn("truncate text-base font-bold sm:text-lg", textoTitulo)}>
                  Turno {turno.id_turno_caja.slice(0, 8).toUpperCase()}
                </h2>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Abierto
                </span>
              </div>
              <p className={cn("truncate text-xs", textoSecundario)}>
                Responsable: <strong>{turno.abierto_por}</strong> · Abierto hace{" "}
                <strong>{formatTranscurrido(turno.fecha_apertura)}</strong> ({formatHora(turno.fecha_apertura)})
              </p>
              {turno.nota_apertura && <p className={cn("truncate text-xs italic", textoSecundario)}>Nota: {turno.nota_apertura}</p>}
            </div>
          </div>

          {/* Acciones del turno: movimiento de efectivo (entrada o salida, se elige en el panel) y Arqueo/Cierre */}
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center">
            {puedeMover && (
              <Button
                id="caja-btn-movimiento"
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setModalMovimiento("ingreso_manual")}
                leftIcon={<ArrowLeftRight className="size-4" />}
                className="w-full gap-1.5 px-2 sm:w-auto sm:px-4"
              >
                Movimiento
              </Button>
            )}
            {puedeAbrirCerrar && (
              <Button
                id="caja-btn-cerrar"
                type="button"
                size="sm"
                onClick={() => setModalCierre(true)}
                leftIcon={<LockKeyhole className="size-4" />}
                className="w-full gap-1.5 bg-[#4C0107] px-2 text-white hover:bg-[#4C0107]/90 sm:w-auto sm:px-4 dark:bg-stone-100 dark:text-stone-900"
              >
                <span className="sm:hidden">Cierre</span>
                <span className="hidden sm:inline">Arqueo y Cierre</span>
              </Button>
            )}
          </div>
        </div>

        {/* En escritorio las métricas viven en la tarjeta del turno */}
        <MetricasTurno fondo={turno.monto_inicial} resumen={resumen} className="hidden xl:grid" />
      </div>

      <SelectorPaneles
        opciones={[
          { id: "principal", label: "Resumen" },
          { id: "movimientos", label: "Movimientos", total: movimientos.length },
          { id: "turnos", label: "Turnos", total: archivados.length },
        ]}
        activo={panel}
        onChange={setPanel}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* En móvil y tablet las métricas son un panel propio */}
        <div
          data-sin-desborde
          className={cn("min-h-0 flex-col overflow-hidden xl:hidden", panel === "principal" ? "flex" : "hidden")}
        >
          <MetricasTurno fondo={turno.monto_inicial} resumen={resumen} className="grid" />
        </div>
        <PanelMovimientos movimientos={movimientos} className={visibilidad("movimientos")} />
        <PanelTurnos turnos={archivados} titulo="Turnos anteriores" className={visibilidad("turnos")} />
      </div>

      {modalMovimiento && (
        <MovimientoCajaForm
          tipoInicial={modalMovimiento}
          efectivoDisponibleCentimos={resumen.efectivoEsperado}
          onClose={() => setModalMovimiento(null)}
          onRegistrar={async (tipo, concepto, monto) =>
            (await registrar({ tipo_movimiento: tipo, metodo_pago: "efectivo", monto, notas: concepto })).isOk()
          }
        />
      )}

      {modalCierre && (
        <CierreCajaForm
          turno={turno}
          resumen={resumen}
          onClose={() => setModalCierre(false)}
          onCerrar={async (montoFinalReal, observaciones, conteo) => {
            const respuesta = await cerrar({ monto_final_real: montoFinalReal, notas_cierre: observaciones, conteo })
            return respuesta?.isOk() ? respuesta.data : null
          }}
        />
      )}
    </div>
  )
}
