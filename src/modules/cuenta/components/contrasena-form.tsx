"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { CampoContrasena } from "@/modules/auth/components/campo-contrasena"
import { cerrarSesionAction } from "@/modules/auth"
import { cambiarContrasenaAction } from "../actions/cuenta.actions"
import { cambiarContrasenaSchema, type CambiarContrasenaValues } from "../schema"
import type { ErrorApi } from "@/lib/api/error-api"

/**
 * Cambio de contraseña. USR-010 (actual incorrecta o nueva igual a la anterior) se pinta en el campo de la actual y
 * USR-015 (contraseña demasiado común) en el de la nueva. Al cambiarla la API cierra TODAS las sesiones (A-007): la web
 * borra la suya y lleva al login con un aviso, en vez de dejar que la siguiente acción dé un 401 sin explicación.
 */
export function ContrasenaForm() {
  const router = useRouter()
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
      } else if (res.error.codigo === "USR-015") {
        // Error de negocio (no viene en `validaciones`): se muestra junto al campo de la contraseña nueva.
        form.setError("contrasena_nueva", { message: res.error.message })
        form.resetField("confirmar")
      } else {
        setError(res.error)
        form.reset()
      }
      return
    }
    form.reset()
    await cerrarSesionAction()
    router.replace("/login?aviso=contrasena")
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
        autoComplete="new-password" // el navegador no debe rellenar la contraseña guardada
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
      <p className="text-[12px] text-muted-foreground">Al cambiarla se cerrará tu sesión en todos los dispositivos.</p>
      <Button type="submit" variant="soft" loading={form.formState.isSubmitting}>
        Cambiar contraseña
      </Button>
    </form>
  )
}
