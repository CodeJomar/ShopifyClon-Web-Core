"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StickyNote, Unlock } from "lucide-react"

import type { TurnoListadoDto } from "@/dtos/caja"
import { useSession } from "@/modules/auth"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { dineroDesdeTexto, formatearDinero } from "@/shared/utils/dinero"

import { aperturaCajaSchema, type AperturaCajaValues } from "../schema"
import { formatFechaHora } from "../utils"
import { opcionClass, tarjetaClass, textoSecundario, textoTitulo } from "./estilos"

/* -------------------------------------------------------------------------- */
/*                         Apertura de turno de caja                          */
/* -------------------------------------------------------------------------- */

const FONDOS_SUGERIDOS = [100, 150, 200, 300] as const

interface AperturaCajaFormProps {
  /** Último turno cerrado: se muestra para recordar con cuánto terminó. */
  ultimoTurno?: TurnoListadoDto
  puedeAbrir: boolean
  onAbrir: (montoInicial: string, notaApertura?: string) => Promise<boolean>
}

export function AperturaCajaForm({ ultimoTurno, puedeAbrir, onAbrir }: AperturaCajaFormProps) {
  const sesion = useSession()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AperturaCajaValues>({
    resolver: zodResolver(aperturaCajaSchema),
    defaultValues: { montoInicial: "", notaApertura: "" },
  })

  const monto = useWatch({ control, name: "montoInicial" })

  const onSubmit = async (values: AperturaCajaValues) => {
    const dinero = dineroDesdeTexto(String(values.montoInicial))
    if (dinero) await onAbrir(dinero, values.notaApertura?.trim() || undefined)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      data-sin-desborde
      className={cn(
        tarjetaClass,
        "flex min-h-0 flex-col gap-4 overflow-hidden p-4 lg:gap-5 lg:p-6 [@media(max-height:760px)]:gap-3"
      )}
      aria-label="Apertura de turno de caja"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#4C0107] text-white dark:bg-[#E7B7BC] dark:text-stone-900">
          <Unlock className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className={cn("text-lg font-bold", textoTitulo)}>Apertura de caja</h2>
          <p className={cn("text-sm [@media(max-height:760px)]:hidden", textoSecundario)}>
            Registra el fondo inicial en efectivo para comenzar a cobrar cuentas.
          </p>
        </div>
      </div>

      {/* En pantallas muy bajas se omite: el último turno también figura en "Turnos anteriores" */}
      <div className="grid grid-cols-2 gap-2 text-xs sm:gap-3 sm:text-sm [@media(max-height:680px)]:hidden">
        <div className="min-w-0 rounded-xl bg-slate-100/70 px-3 py-2 sm:px-4 sm:py-3 dark:bg-stone-800">
          <span className={cn("block text-xs", textoSecundario)}>Cajero responsable</span>
          <span className={cn("block truncate font-semibold", textoTitulo)}>{sesion.nombre}</span>
        </div>
        <div className="min-w-0 rounded-xl bg-slate-100/70 px-3 py-2 sm:px-4 sm:py-3 dark:bg-stone-800">
          <span className={cn("block text-xs", textoSecundario)}>Último turno</span>
          <span className={cn("block truncate font-semibold", textoTitulo)}>
            {ultimoTurno?.fecha_cierre
              ? `${formatFechaHora(ultimoTurno.fecha_cierre)} · ${formatearDinero(ultimoTurno.monto_final_real)}`
              : "Sin registros"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FloatingInput
          id="caja-monto-inicial"
          label="Monto inicial en efectivo"
          leftIcon={<span className="text-sm font-semibold">S/</span>}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.10"
          disabled={!puedeAbrir}
          state={errors.montoInicial ? "error" : "default"}
          className="[&_input]:text-base [&_input]:tabular-nums"
          {...register("montoInicial")}
        />
        {errors.montoInicial && <span className="px-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.montoInicial.message}</span>}
        <div className="flex flex-wrap gap-2 pt-1">
          {FONDOS_SUGERIDOS.map((fondo) => (
            <button
              key={fondo}
              type="button"
              disabled={!puedeAbrir}
              onClick={() => setValue("montoInicial", String(fondo), { shouldValidate: true })}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                opcionClass(Number(monto) === fondo)
              )}
            >
              S/ {fondo}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <FloatingInput
          id="caja-nota-apertura"
          label="Nota de apertura (opcional)"
          leftIcon={<StickyNote size={18} />}
          maxLength={255}
          autoComplete="off"
          disabled={!puedeAbrir}
          state={errors.notaApertura ? "error" : "default"}
          {...register("notaApertura")}
        />
        {errors.notaApertura && <span className="px-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.notaApertura.message}</span>}
      </div>

      <Button
        id="caja-abrir-turno"
        type="submit"
        loading={isSubmitting}
        disabled={!puedeAbrir}
        leftIcon={<Unlock className="size-4" />}
        className="w-full"
      >
        Abrir turno de caja
      </Button>
      {!puedeAbrir && (
        <p className={cn("text-center text-xs", textoSecundario)}>Tu cargo no tiene permiso para abrir la caja.</p>
      )}
    </form>
  )
}
