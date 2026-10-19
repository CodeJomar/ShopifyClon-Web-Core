"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"

import { grupoFormSchema, type GrupoFormValues, type GrupoMenu } from "../schema"
import { GrupoCampos } from "./grupo-campos"

const GRUPO_VACIO: GrupoFormValues = { nombre: "", seleccionMinima: "0", seleccionMaxima: "1" }

/** Panel (sheet) para crear o editar un grupo de personalización: nombre y reglas de selección. */
export function GrupoSheet({
  grupo,
  onGuardar,
  onClose,
}: {
  // Grupo a editar; si no se envía, se crea uno nuevo
  grupo?: GrupoMenu
  // Devuelve true si se guardó (entonces el panel se cierra)
  onGuardar: (values: GrupoFormValues) => Promise<boolean>
  onClose: () => void
}) {
  const formId = React.useId()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GrupoFormValues>({
    resolver: zodResolver(grupoFormSchema),
    defaultValues: grupo
      ? { nombre: grupo.nombre, seleccionMinima: String(grupo.seleccion_minima), seleccionMaxima: String(grupo.seleccion_maxima) }
      : GRUPO_VACIO,
  })

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={grupo ? "Editar grupo" : "Nuevo grupo"}
      description="Define qué elige el cliente al pedir y cuántas opciones puede tomar."
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} size="md" disabled={isSubmitting}>
            {grupo ? "Guardar cambios" : "Crear grupo"}
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
        <GrupoCampos register={register} errors={errors} idBase={`grupo-sheet-${grupo?.id_grupo ?? "nuevo"}`} />
      </form>
    </FormPanel>
  )
}
