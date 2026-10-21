"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { toast } from "@/shared/components/ui/toast"
import { CampoContrasena } from "@/modules/auth/components/campo-contrasena"
import { cambiarContrasenaAction } from "../actions/cuenta.actions"
import { cambiarContrasenaSchema, type CambiarContrasenaValues } from "../schema"
import type { ErrorApi } from "@/lib/api/error-api"

/** Cambio de contraseña. USR-010 (actual incorrecta o nueva igual a la anterior) se pinta en el campo de la actual. */
export function ContrasenaForm() {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const form = useForm<CambiarContrasenaValues>({
    resolver: zodResolver(cambiarContrasenaSchema),
    defaultValues: { contrasena_actual: "", contrasena_nueva: "", confirmar: "" },
  })

  const cambiar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await cambiarContrasenaAction({
      contrasena_actual: valores.contrasena_actual,
      contrasena_nueva: valores.contrasena_nueva,
    })
    if (!res.ok) {
      // Con USR-010 el error queda en el campo de la actual (no se limpia); el resto va en la alerta.
      if (res.error.codigo === "USR-010") {
        form.setError("contrasena_actual", { message: res.error.message })
        form.resetField("contrasena_nueva")
        form.resetField("confirmar")
      } else {
        setError(res.error)
        form.reset()
      }
      return
    }
    toast.add({ type: "success", title: "Contraseña actualizada", description: "Usa la nueva la próxima vez que inicies sesión." })
    form.reset()
  })

  const estado = (campo: keyof CambiarContrasenaValues) => (form.formState.errors[campo] ? "error" : "default") as "error" | "default"

  return (
    <form onSubmit={cambiar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cambiar tu contraseña</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <CampoContrasena
        label="Contraseña actual"
        autoComplete="current-password"
        state={estado("contrasena_actual")}
        mensajeError={form.formState.errors.contrasena_actual?.message}
        {...form.register("contrasena_actual")}
      />
      <CampoContrasena
        label="Contraseña nueva"
        autoComplete="new-password"
        ayuda="Entre 8 y 72 caracteres, con letras y números."
        state={estado("contrasena_nueva")}
        mensajeError={form.formState.errors.contrasena_nueva?.message}
        {...form.register("contrasena_nueva")}
      />
      <CampoContrasena
        label="Confirma la contraseña nueva"
        autoComplete="new-password"
        state={estado("confirmar")}
        mensajeError={form.formState.errors.confirmar?.message}
        {...form.register("confirmar")}
      />
      <Button type="submit" variant="soft" loading={form.formState.isSubmitting}>
        Cambiar contraseña
      </Button>
    </form>
  )
}
