"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { cn } from "@/shared/utils/cn"
import { getAreaConfig } from "@/shared/utils/mesa-visual"

import { CAPACIDAD_MAXIMA_MESA, mesaFormSchema, mesaToFormValues, type Mesa, type MesaFormValues } from "../schema"
import { errorClass, opcionClass } from "./estilos"
import { PieFormulario } from "./pie-formulario"

/** Panel lateral para registrar o editar una mesa del plano. */
export function MesaForm({
  mesa,
  areas,
  areaPorDefecto,
  onGuardar,
  onClose,
}: {
  // Mesa a editar; si no se envía, se registra una nueva
  mesa?: Mesa
  // Áreas que ya existen en el plano (para elegirlas con un toque)
  areas: string[]
  areaPorDefecto?: string
  // Devuelve true si se guardó (entonces el panel se cierra)
  onGuardar: (values: MesaFormValues, mesa?: Mesa) => Promise<boolean>
  onClose: () => void
}) {
  const esEdicion = Boolean(mesa)
  const formId = React.useId()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MesaFormValues>({
    resolver: zodResolver(mesaFormSchema),
    defaultValues: mesaToFormValues(mesa, areaPorDefecto ?? areas[0] ?? ""),
  })

  const areaActual = useWatch({ control, name: "area" })

  const onSubmit = async (values: MesaFormValues) => {
    if (await onGuardar(values, mesa)) onClose()
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={esEdicion ? "Editar mesa" : "Nueva mesa"}
      description="Los mozos verán este identificador en el mapa de mesas del POS."
      footer={
        <PieFormulario
          formId={formId}
          onCancelar={onClose}
          enviando={isSubmitting}
          textoEnviar={esEdicion ? "Guardar cambios" : "Registrar mesa"}
        />
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_9rem]">
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              id="mesa-numero"
              label="Identificador (Ej. M-10)"
              {...register("numero")}
              autoComplete="off"
              maxLength={10}
              state={errors.numero ? "error" : "default"}
              aria-invalid={Boolean(errors.numero)}
            />
            {errors.numero && <p className={errorClass}>{errors.numero.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              id="mesa-capacidad"
              label="Capacidad"
              {...register("capacidad")}
              type="number"
              inputMode="numeric"
              min={1}
              max={CAPACIDAD_MAXIMA_MESA}
              state={errors.capacidad ? "error" : "default"}
              aria-invalid={Boolean(errors.capacidad)}
            />
            {errors.capacidad && <p className={errorClass}>{errors.capacidad.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="mesa-area"
            label="Área de atención (Ej. Salón, Terraza)"
            {...register("area")}
            autoComplete="off"
            maxLength={30}
            state={errors.area ? "error" : "default"}
            aria-invalid={Boolean(errors.area)}
          />
          {errors.area && <p className={errorClass}>{errors.area.message}</p>}
          {areas.length > 0 && (
            <div role="group" aria-label="Áreas existentes" className="flex flex-wrap gap-2 pt-1">
              {areas.map((area) => {
                const config = getAreaConfig(area)
                const activa = areaActual.trim() === area
                return (
                  <button
                    key={area}
                    type="button"
                    aria-pressed={activa}
                    onClick={() => setValue("area", area, { shouldValidate: true })}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                      opcionClass(activa)
                    )}
                  >
                    <config.icon className="size-3.5" />
                    {area}
                  </button>
                )
              })}
            </div>
          )}
          <p className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-stone-400">
            <Lock className="mt-0.5 size-3 shrink-0" />
            El área es un texto libre: escribe una nueva para crearla o toca una existente.
          </p>
        </div>
      </form>
    </FormPanel>
  )
}
