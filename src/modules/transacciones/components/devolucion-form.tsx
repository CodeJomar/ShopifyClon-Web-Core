"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Undo2 } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"
import { useClaveIdempotencia } from "@/shared/hooks/use-clave-idempotencia"
import { cn } from "@/shared/utils/cn"
import { desdeCentimos, dineroDesdeTexto, formatearCentimos, formatearDinero } from "@/shared/utils/dinero"

import { METODO_PAGO_LABELS, crearDevolucionSchema, type DevolucionValues } from "../schema"
import { botonPeligroClass, textoAcento } from "./estilos"
import type { CobroDevolvible } from "./comprobante-modal"

interface DevolucionFormProps {
  cobro: CobroDevolvible
  /** Número del pedido (#12) para el título. */
  numero: string
  onClose: () => void
  /** Devuelve true si se registró (entonces el panel se cierra). */
  onDevolver: (payload: { id_transaccion_origen: string; monto: string; motivo: string }, clave: string) => Promise<boolean>
}

const mensajeError = "px-1 text-xs font-medium text-red-600 dark:text-red-400"

/** Devolución total o parcial de un cobro, en un panel lateral. */
export function DevolucionForm({ cobro, numero, onClose, onDevolver }: DevolucionFormProps) {
  const formId = React.useId()
  const schema = React.useMemo(() => crearDevolucionSchema(cobro.devolvibleCentimos), [cobro.devolvibleCentimos])
  const { obtener, reiniciar } = useClaveIdempotencia()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DevolucionValues>({
    resolver: zodResolver(schema),
    defaultValues: { monto: desdeCentimos(cobro.devolvibleCentimos), motivo: "" },
  })

  const onSubmit = async (values: DevolucionValues) => {
    const monto = dineroDesdeTexto(String(values.monto))
    if (!monto) return
    const payload = { id_transaccion_origen: cobro.id_transaccion, monto, motivo: values.motivo.trim() }
    // Misma clave mientras el contenido no cambie: un doble toque o un reintento no devuelve dos veces
    const ok = await onDevolver(payload, obtener(JSON.stringify(payload)))
    if (ok) {
      reiniciar()
      onClose()
    }
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={`Devolver cobro · ${numero}`}
      description={`${METODO_PAGO_LABELS[cobro.metodo_pago]} · cobrado ${formatearDinero(cobro.monto)}`}
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Volver
          </Button>
          <Button id="devolucion-confirmar" type="submit" form={formId} size="md" disabled={isSubmitting} leftIcon={<Undo2 className="size-4" />} className={cn(botonPeligroClass)}>
            Confirmar devolución
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
          La devolución no borra el cobro: queda registrada en el libro de caja con tu usuario, la fecha y el motivo, y resta de
          las ventas del turno.
        </p>

        <div className="flex flex-col gap-1">
          <FloatingInput
            id="devolucion-monto"
            label="Monto a devolver"
            leftIcon={<span className="text-sm font-semibold">S/</span>}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.10"
            state={errors.monto ? "error" : "default"}
            className="[&_input]:tabular-nums"
            {...register("monto")}
          />
          <button
            type="button"
            onClick={() => setValue("monto", desdeCentimos(cobro.devolvibleCentimos), { shouldValidate: true })}
            className={cn("w-fit cursor-pointer px-1 text-xs font-semibold hover:underline", textoAcento)}
          >
            Devolver todo ({formatearCentimos(cobro.devolvibleCentimos)})
          </button>
          {errors.monto && <span className={mensajeError}>{errors.monto.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <FloatingTextarea
            id="devolucion-motivo"
            label="Motivo de la devolución"
            maxLength={255}
            rows={3}
            state={errors.motivo ? "error" : "default"}
            {...register("motivo")}
          />
          {errors.motivo && <span className={mensajeError}>{errors.motivo.message}</span>}
        </div>
      </form>
    </FormPanel>
  )
}
