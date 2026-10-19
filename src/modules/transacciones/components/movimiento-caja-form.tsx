"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDownCircle, ArrowUpCircle, StickyNote } from "lucide-react"

import type { TipoMovimientoManual } from "@/dtos/caja"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { dineroDesdeTexto, formatearCentimos } from "@/shared/utils/dinero"

import { TIPO_MOVIMIENTO_LABELS, TIPOS_MOVIMIENTO_MANUAL, crearMovimientoSchema, type MovimientoValues } from "../schema"
import { opcionClass } from "./estilos"

/* -------------------------------------------------------------------------- */
/*                       Entradas y salidas de efectivo                       */
/* -------------------------------------------------------------------------- */

interface MovimientoCajaFormProps {
  tipoInicial: TipoMovimientoManual
  efectivoDisponibleCentimos: number
  onClose: () => void
  /** Devuelve true si se registró (entonces el panel se cierra). */
  onRegistrar: (tipo: TipoMovimientoManual, concepto: string, monto: string) => Promise<boolean>
}

const mensajeError = "px-1 text-xs font-medium text-red-600 dark:text-red-400"

export function MovimientoCajaForm({ tipoInicial, efectivoDisponibleCentimos, onClose, onRegistrar }: MovimientoCajaFormProps) {
  const formId = React.useId()
  const schema = React.useMemo(() => crearMovimientoSchema(efectivoDisponibleCentimos), [efectivoDisponibleCentimos])
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: tipoInicial, concepto: "", monto: "" },
  })
  const tipo = useWatch({ control, name: "tipo" })

  const onSubmit = async (values: MovimientoValues) => {
    const dinero = dineroDesdeTexto(String(values.monto))
    if (!dinero) return
    if (await onRegistrar(values.tipo, values.concepto.trim(), dinero)) onClose()
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title="Movimiento de caja"
      description={`Efectivo disponible: ${formatearCentimos(efectivoDisponibleCentimos)}`}
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button id="caja-movimiento-guardar" type="submit" form={formId} size="md" disabled={isSubmitting}>
            Registrar {tipo === "ingreso_manual" ? "entrada" : "salida"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de movimiento">
          {TIPOS_MOVIMIENTO_MANUAL.map((opcion) => {
            const Icono = opcion === "ingreso_manual" ? ArrowDownCircle : ArrowUpCircle
            const activo = tipo === opcion
            return (
              <button
                key={opcion}
                id={`caja-movimiento-${opcion}`}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setValue("tipo", opcion, { shouldValidate: true })}
                className={cn(
                  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border text-xs font-semibold transition-colors",
                  opcionClass(activo)
                )}
              >
                <Icono className="size-4" />
                {TIPO_MOVIMIENTO_LABELS[opcion]}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-1">
          <FloatingInput
            id="caja-movimiento-concepto"
            label="Motivo"
            leftIcon={<StickyNote size={18} />}
            maxLength={255}
            autoComplete="off"
            state={errors.concepto ? "error" : "default"}
            {...register("concepto")}
          />
          {errors.concepto && <span className={mensajeError}>{errors.concepto.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <FloatingInput
            id="caja-movimiento-monto"
            label="Monto (efectivo)"
            leftIcon={<span className="text-sm font-semibold">S/</span>}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.10"
            state={errors.monto ? "error" : "default"}
            className="[&_input]:tabular-nums"
            {...register("monto")}
          />
          {errors.monto && <span className={mensajeError}>{errors.monto.message}</span>}
        </div>
      </form>
    </FormPanel>
  )
}
