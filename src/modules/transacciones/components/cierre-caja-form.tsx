"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator, LockKeyhole, Printer } from "lucide-react"
import type { ConteoArqueo, TurnoActualDto, TurnoCajaDto } from "@/dtos/caja"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { aCentimos, desdeCentimos, formatearCentimos, formatearDinero } from "@/shared/utils/dinero"
import { DENOMINACIONES, RESULTADO_ARQUEO_LABELS, calcularContadoCentimos, crearCierreCajaSchema, obtenerResultadoArqueo, type CierreCajaValues, type ResumenTurno } from "../schema"
import { RESULTADO_ARQUEO_CONFIG } from "./config-visual"
import { CampoError, ModalShell, PieAcciones } from "./modal-shell"
import { textoCuerpo, textoEtiqueta, textoSecundario, textoTitulo } from "./estilos"
import { formatHora, formatTranscurrido } from "../utils"

/* -------------------------------------------------------------------------- */
/*                      Arqueo y cierre del turno de caja                     */
/* -------------------------------------------------------------------------- */

export function CierreCajaForm({
  turno,
  resumen,
  onClose,
  onCerrar,
}: {
  turno: TurnoActualDto["turno"]
  resumen: ResumenTurno
  onClose: () => void
  onCerrar: (montoFinalReal: string, observaciones?: string, conteo?: ConteoArqueo) => Promise<TurnoCajaDto | null>
}) {
  const [turnoCerrado, setTurnoCerrado] = React.useState<TurnoCajaDto | null>(null)
  const schema = React.useMemo(() => crearCierreCajaSchema(resumen.efectivoEsperado), [resumen.efectivoEsperado])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CierreCajaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      conteo: Object.fromEntries(DENOMINACIONES.map((d) => [d.clave, ""])),
      observaciones: "",
    },
  })

  const conteo = useWatch({ control, name: "conteo" })
  const contado = calcularContadoCentimos(conteo ?? {})
  const diferencia = contado - resumen.efectivoEsperado
  const resultado = obtenerResultadoArqueo(diferencia)
  const resultadoConf = RESULTADO_ARQUEO_CONFIG[resultado]

  const onSubmit = async (values: CierreCajaValues) => {
    // Solo viajan las denominaciones contadas (cantidad mayor que cero); la API comprueba que sumen el monto
    const conteoEnviado = Object.fromEntries(
      DENOMINACIONES.map((d) => [d.clave, Number(values.conteo[d.clave]) || 0]).filter(([, cantidad]) => Number(cantidad) > 0),
    ) as ConteoArqueo
    const cerrado = await onCerrar(
      desdeCentimos(calcularContadoCentimos(values.conteo)),
      values.observaciones?.trim() || undefined,
      Object.keys(conteoEnviado).length > 0 ? conteoEnviado : undefined,
    )
    if (cerrado) setTurnoCerrado(cerrado)
  }

  if (turnoCerrado) {
    const resultadoFinal = obtenerResultadoArqueo(aCentimos(turnoCerrado.diferencia))
    const conf = RESULTADO_ARQUEO_CONFIG[resultadoFinal]
    return (
      <ModalShell titulo="Caja cerrada" subtitulo={turnoCerrado.id_turno_caja.slice(0, 8).toUpperCase()} icono={<LockKeyhole className="size-5" />} onClose={onClose}>
        <div className="flex flex-col gap-5 overflow-y-auto p-5" aria-live="polite">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", conf.badge)}>
              {RESULTADO_ARQUEO_LABELS[resultadoFinal]}
            </span>
            {turnoCerrado.fecha_cierre && (
              <p className={cn("text-sm", textoCuerpo)}>
                El turno se cerró a las {formatHora(turnoCerrado.fecha_cierre)} tras{" "}
                {formatTranscurrido(turnoCerrado.fecha_apertura, turnoCerrado.fecha_cierre)} de operación.
              </p>
            )}
          </div>
          <ResumenFilas
            filas={[
              { label: "Efectivo esperado", valor: formatearDinero(turnoCerrado.monto_final_calculado) },
              { label: "Efectivo contado", valor: formatearDinero(turnoCerrado.monto_final_real) },
              { label: "Diferencia", valor: formatearDinero(turnoCerrado.diferencia), className: conf.texto },
              { label: "Ventas totales", valor: formatearCentimos(resumen.ventasTotales) },
            ]}
          />
        </div>
        <PieAcciones>
          <Button
            type="button"
            variant="neutral"
            size="md"
            onClick={() => window.print()}
            leftIcon={<Printer className="size-4" />}
          >
            Imprimir
          </Button>
          <Button type="button" size="md" onClick={onClose}>
            Finalizar
          </Button>
        </PieAcciones>
      </ModalShell>
    )
  }

  return (
    <ModalShell
      titulo="Arqueo y cierre de caja"
      subtitulo={`Abierto hace ${formatTranscurrido(turno.fecha_apertura)} por ${turno.abierto_por}`}
      icono={<Calculator className="size-5" />}
      ancho="max-w-6xl"
      bloqueado={isSubmitting}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="grid min-h-0 grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Conteo físico por denominación */}
          <fieldset className="flex flex-col gap-3">
            <legend className={cn("mb-3", textoEtiqueta)}>Conteo de efectivo</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {DENOMINACIONES.map((d) => {
                const cantidad = Number(conteo?.[d.clave]) || 0
                return (
                  <div key={d.clave} className="flex flex-col gap-1">
                    <FloatingInput
                      id={`caja-conteo-${d.clave}`}
                      label={`S/ ${d.centimos < 100 ? (d.centimos / 100).toFixed(2) : d.centimos / 100} · ${d.tipo}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      className="[&_input]:tabular-nums"
                      {...register(`conteo.${d.clave}`)}
                    />
                    <span className={cn("px-1 text-right text-[11px] tabular-nums", textoSecundario)}>
                      {formatearCentimos(cantidad * d.centimos)}
                    </span>
                  </div>
                )
              })}
            </div>
            <CampoError mensaje={(errors.conteo as { message?: string } | undefined)?.message} />
          </fieldset>

          {/* Cálculo automático de diferencias */}
          <div className="flex flex-col gap-3">
            <span className={textoEtiqueta}>Resumen del turno</span>
            <ResumenFilas
              filas={[
                { label: "Fondo inicial", valor: formatearDinero(turno.monto_inicial) },
                { label: "Ventas en efectivo", valor: formatearCentimos(resumen.ventasEfectivo) },
                { label: "Entradas de dinero", valor: `+ ${formatearCentimos(resumen.ingresos)}` },
                { label: "Salidas de dinero", valor: `- ${formatearCentimos(resumen.retiros)}` },
                { label: "Devoluciones", valor: `- ${formatearCentimos(resumen.devoluciones)}` },
              ]}
            />
            <ResumenFilas
              filas={[
                { label: "Tarjeta (no se cuenta)", valor: formatearCentimos(resumen.ventasTarjeta) },
                { label: "Digitales (no se cuentan)", valor: formatearCentimos(resumen.ventasDigitales) },
              ]}
            />

            <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-4 dark:bg-stone-800">
              <div className="flex items-center justify-between text-sm">
                <span className={textoCuerpo}>Esperado en caja</span>
                <span className={cn("font-semibold tabular-nums", textoTitulo)}>
                  {formatearCentimos(resumen.efectivoEsperado)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={textoCuerpo}>Contado</span>
                <span className={cn("font-semibold tabular-nums", textoTitulo)}>{formatearCentimos(contado)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 dark:border-stone-700">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold uppercase", resultadoConf.badge)}>
                  {RESULTADO_ARQUEO_LABELS[resultado]}
                </span>
                <span className={cn("text-xl font-bold tabular-nums", resultadoConf.texto)} aria-live="polite">
                  {diferencia > 0 ? "+" : ""}
                  {formatearCentimos(diferencia)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <FloatingTextarea
                id="caja-observaciones"
                label={diferencia === 0 ? "Observaciones (opcional)" : "Explica el motivo de la diferencia"}
                maxLength={255}
                rows={3}
                state={errors.observaciones ? "error" : "default"}
                {...register("observaciones")}
              />
              <CampoError mensaje={errors.observaciones?.message} />
            </div>
          </div>
        </div>

        <PieAcciones>
          <Button
            type="button"
            variant="neutral"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            id="caja-confirmar-cierre"
            type="submit"
            size="md"
            loading={isSubmitting}
            leftIcon={<LockKeyhole className="size-4" />}
            className="sm:w-80!"
          >
            Cerrar caja con {formatearCentimos(contado)}
          </Button>
        </PieAcciones>
      </form>
    </ModalShell>
  )
}

function ResumenFilas({ filas }: { filas: { label: string; valor: string; className?: string }[] }) {
  return (
    <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4 dark:divide-stone-800 dark:border-stone-800">
      {filas.map((fila) => (
        <li key={fila.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className={textoSecundario}>{fila.label}</span>
          <span className={cn("font-semibold tabular-nums", fila.className ?? textoTitulo)}>{fila.valor}</span>
        </li>
      ))}
    </ul>
  )
}
