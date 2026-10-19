"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"

import { opcionFormSchema, type GrupoMenu, type OpcionFormValues, type OpcionMenu } from "../schema"
import { errorClass } from "./estilos"

/** Panel (sheet) para agregar o editar una opción de un grupo: nombre y cuánto suma o resta al precio. */
export function OpcionSheet({
  grupo,
  opcion,
  onGuardar,
  onClose,
}: {
  grupo: GrupoMenu
  // Opción a editar; si no se envía, se agrega una nueva al grupo
  opcion?: OpcionMenu
  // Devuelve true si se guardó (entonces el panel se cierra)
  onGuardar: (values: OpcionFormValues) => Promise<boolean>
  onClose: () => void
}) {
  const formId = React.useId()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OpcionFormValues>({
    resolver: zodResolver(opcionFormSchema),
    defaultValues: { nombre: opcion?.nombre ?? "", precioDelta: opcion && opcion.price_delta !== "0.00" ? opcion.price_delta : "" },
  })

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={opcion ? "Editar opción" : "Nueva opción"}
      description={`Grupo: ${grupo.nombre}`}
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} size="md" disabled={isSubmitting}>
            {opcion ? "Guardar cambios" : "Agregar opción"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit(async (values) => {
          if (await onGuardar(values)) onClose()
        })}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="opcion-nombre"
            label="Nombre de la opción"
            {...register("nombre")}
            maxLength={60}
            autoComplete="off"
            state={errors.nombre ? "error" : "default"}
            aria-invalid={Boolean(errors.nombre)}
          />
          {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="opcion-precio"
            label="Variación de precio S/ (opcional)"
            {...register("precioDelta")}
            inputMode="decimal"
            autoComplete="off"
            state={errors.precioDelta ? "error" : "default"}
            aria-invalid={Boolean(errors.precioDelta)}
          />
          {errors.precioDelta ? (
            <p className={errorClass}>{errors.precioDelta.message}</p>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-stone-400">
              Lo que suma al precio del producto (por ejemplo 1.50). Con signo menos resta; vacío = sin costo.
            </p>
          )}
        </div>
      </form>
    </FormPanel>
  )
}
