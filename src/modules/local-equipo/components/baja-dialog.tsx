"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserMinus } from "lucide-react"

import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

import { bajaFormSchema, type BajaFormValues, type Empleado } from "../schema"
import { errorClass } from "./estilos"

/** Diálogo para dar de baja a un empleado, con el motivo opcional (queda en su ficha). */
export function BajaDialog({
  empleado,
  onConfirmar,
  onClose,
}: {
  empleado: Empleado
  // Devuelve true si se dio de baja (entonces el diálogo se cierra)
  onConfirmar: (empleado: Empleado, motivo: string) => Promise<boolean>
  onClose: () => void
}) {
  const formId = React.useId()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BajaFormValues>({ resolver: zodResolver(bajaFormSchema), defaultValues: { motivo: "" } })

  const onSubmit = async ({ motivo }: BajaFormValues) => {
    if (await onConfirmar(empleado, motivo)) onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <UserMinus className="size-5" />
          </div>
          <DialogTitle>Dar de baja</DialogTitle>
          <DialogDescription>
            {empleado.nombre} perderá el acceso al sistema y sus sesiones se cerrarán. Sus pedidos y movimientos de caja se conservan.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1.5 p-5" noValidate>
          <FloatingTextarea
            id="baja-motivo"
            label="Motivo de la baja (opcional)"
            {...register("motivo")}
            maxLength={255}
            rows={3}
            state={errors.motivo ? "error" : "default"}
            aria-invalid={Boolean(errors.motivo)}
          />
          {errors.motivo && <p className={errorClass}>{errors.motivo.message}</p>}
        </form>

        <DialogFooter>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} size="md" variant="danger-strong" disabled={isSubmitting}>
            Dar de baja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
