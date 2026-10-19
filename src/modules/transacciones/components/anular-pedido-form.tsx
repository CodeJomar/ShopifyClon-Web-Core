"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Ban } from "lucide-react"

import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"

import { anulacionSchema, type AnulacionValues } from "../schema"
import { botonPeligroClass } from "./estilos"

interface AnularPedidoFormProps {
  idPedido: string
  /** Número del pedido (#12) para el título. */
  numero: string
  /** Lugar y total, para reconocer el pedido. */
  detalle: string
  onClose: () => void
  /** Devuelve true si se anuló (entonces el panel se cierra). */
  onAnular: (idPedido: string, motivo: string) => Promise<boolean>
}

/** Anulación auditada de un pedido: exige el motivo y queda registrada en su bitácora. */
export function AnularPedidoForm({ idPedido, numero, detalle, onClose, onAnular }: AnularPedidoFormProps) {
  const formId = React.useId()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnulacionValues>({
    resolver: zodResolver(anulacionSchema),
    defaultValues: { motivo: "" },
  })

  const onSubmit = async (values: AnulacionValues) => {
    if (await onAnular(idPedido, values.motivo.trim())) onClose()
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={`Anular ${numero}`}
      description={detalle}
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Volver
          </Button>
          <Button id="pedido-confirmar-anulacion" type="submit" form={formId} size="md" disabled={isSubmitting} leftIcon={<Ban className="size-4" />} className={botonPeligroClass}>
            Confirmar anulación
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
          El pedido no se elimina: quedará registrado como <strong>anulado</strong> con tu usuario, la fecha y el motivo, y dejará de
          aparecer en cocina.
        </p>
        <div className="flex flex-col gap-1">
          <FloatingTextarea
            id="pedido-motivo-anulacion"
            label="Motivo de la anulación"
            maxLength={255}
            rows={3}
            state={errors.motivo ? "error" : "default"}
            {...register("motivo")}
          />
          {errors.motivo && <span className="px-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.motivo.message}</span>}
        </div>
      </form>
    </FormPanel>
  )
}
