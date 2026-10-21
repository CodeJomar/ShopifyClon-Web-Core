"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { toast } from "@/shared/components/ui/toast"
import type { ErrorApi } from "@/lib/api/error-api"
import { activarTiendaAction, desactivarTiendaAction } from "../actions/tienda.actions"
import { estadoTiendaSchema, type EstadoTiendaValues } from "../schema"

export const FORMULARIO_ESTADO_TIENDA = "formulario-estado-tienda"

interface CambiarEstadoTiendaFormProps {
  accion: "activar" | "desactivar"
  onGuardado: () => void
}

export function CambiarEstadoTiendaForm({ accion, onGuardado }: CambiarEstadoTiendaFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<EstadoTiendaValues>({
    resolver: zodResolver(estadoTiendaSchema),
    defaultValues: {
      motivo: "",
    },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const datos = valores.motivo?.trim() ? { motivo: valores.motivo.trim() } : undefined
    const res = accion === "activar" ? await activarTiendaAction(datos) : await desactivarTiendaAction(datos)
    if (!res.ok) {
      return setError(res.error)
    }

    toast.add({
      type: "success",
      title: accion === "activar" ? "Tienda activada" : "Tienda desactivada",
    })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_ESTADO_TIENDA} onSubmit={guardar} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cambiar el estado</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <p className="text-[13px] text-muted-foreground">
        {accion === "desactivar"
          ? "Al desactivar la tienda, la vitrina pública quedará fuera de línea y los compradores no podrán ver tus productos ni realizar pedidos. El acceso al panel de administración permanecerá disponible."
          : "Al activar la tienda, la vitrina volverá a estar disponible para el público si tu suscripción se encuentra vigente."}
      </p>

      <FloatingTextarea
        label="Motivo (opcional)"
        rows={3}
        state={form.formState.errors.motivo ? "error" : "default"}
        {...form.register("motivo")}
      />
      <p className="text-[11px] text-muted-foreground">
        Opcional. Se registrará en la auditoría de la tienda (máx. 255 caracteres).
      </p>
      {form.formState.errors.motivo && (
        <p className="text-[11px] font-bold text-destructive-text">
          {form.formState.errors.motivo.message}
        </p>
      )}
    </form>
  )
}
