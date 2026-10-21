"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Phone, User } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import { actualizarPerfilAction } from "../actions/cuenta.actions"
import { perfilSchema, type PerfilValues } from "../schema"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

/** Edita nombres, apellidos y teléfono. El correo no se edita (se muestra abajo, de solo lectura). */
export function PerfilForm({ perfil, onGuardado }: { perfil: PerfilCuentaDto; onGuardado: (perfil: PerfilCuentaDto) => void }) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const form = useForm<PerfilValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombres: perfil.nombres, apellidos: perfil.apellidos, telefono: perfil.telefono ?? "" },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await actualizarPerfilAction({ ...valores, telefono: valores.telefono || undefined })
    if (!res.ok) {
      for (const [campo, mensaje] of Object.entries(res.error.validaciones ?? {})) {
        form.setError(campo as keyof PerfilValues, { message: mensaje })
      }
      return setError(res.error)
    }
    toast.add({ type: "success", title: "Perfil actualizado" })
    onGuardado(res.datos)
  })

  const estado = (campo: keyof PerfilValues) => (form.formState.errors[campo] ? "error" : "default") as "error" | "default"

  return (
    <form onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar tu perfil</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <FloatingInput
        label="Nombres"
        leftIcon={<User className="size-4" aria-hidden="true" />}
        autoComplete="given-name"
        state={estado("nombres")}
        mensajeError={form.formState.errors.nombres?.message}
        {...form.register("nombres")}
      />
      <FloatingInput
        label="Apellidos"
        leftIcon={<User className="size-4" aria-hidden="true" />}
        autoComplete="family-name"
        state={estado("apellidos")}
        mensajeError={form.formState.errors.apellidos?.message}
        {...form.register("apellidos")}
      />
      <FloatingInput
        label="Teléfono (opcional)"
        leftIcon={<Phone className="size-4" aria-hidden="true" />}
        type="tel"
        autoComplete="tel"
        state={estado("telefono")}
        mensajeError={form.formState.errors.telefono?.message}
        {...form.register("telefono")}
      />
      <Button type="submit" loading={form.formState.isSubmitting}>
        Guardar cambios
      </Button>
    </form>
  )
}
