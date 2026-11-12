"use client"

import * as React from "react"
import { Mail, Phone, TriangleAlert, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import { CampoContrasena } from "../components/campo-contrasena"
import { registroAction } from "../actions/auth.actions"
import { registroSchema, type RegistroValues } from "../schema"
import type { ErrorApi } from "@/lib/api/error-api"

export function RegistroView() {
  const router = useRouter()
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const form = useForm<RegistroValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombres: "", apellidos: "", correo_electronico: "", telefono: "", contrasena: "" },
  })

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await registroAction({ ...valores, telefono: valores.telefono || undefined })
    if (res.ok) {
      toast.add({ type: "success", title: "Cuenta creada", description: "Revisa tu correo y escribe el código de 6 dígitos." })
      router.push(`/activar-cuenta?correo=${encodeURIComponent(valores.correo_electronico)}`)
      return
    }
    const e = res.error
    for (const [campo, mensaje] of Object.entries(e.validaciones ?? {})) {
      form.setError(campo as keyof RegistroValues, { message: mensaje })
    }
    // USR-015 (contraseña demasiado común o con el nombre del correo) es un error de negocio: va junto al campo, no en la alerta.
    if (e.codigo === "USR-015") {
      form.setError("contrasena", { message: e.message })
      return
    }
    setError(e)
    form.resetField("contrasena")
  })

  const campo = (nombre: keyof RegistroValues) => (form.formState.errors[nombre] ? "error" : "default") as "error" | "default"
  const mensaje = (nombre: keyof RegistroValues) => form.formState.errors[nombre]?.message

  return (
    <div className="otemu-auth-fields space-y-6">
      <div>
        <h1 className="text-[29px] font-extrabold tracking-tight text-foreground">Crea tu cuenta</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Después te enviaremos un código para activarla.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>No pudimos crear tu cuenta</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={enviar} noValidate className="space-y-5">
        <FloatingInput
          leftIcon={<User className="size-4" aria-hidden="true" />} label="Nombres" autoComplete="given-name" state={campo("nombres")} mensajeError={mensaje("nombres")} {...form.register("nombres")} />
        <FloatingInput
          leftIcon={<User className="size-4" aria-hidden="true" />} label="Apellidos" autoComplete="family-name" state={campo("apellidos")} mensajeError={mensaje("apellidos")} {...form.register("apellidos")} />
        <FloatingInput
          leftIcon={<Mail className="size-4" aria-hidden="true" />} label="Correo electrónico" type="email" autoComplete="email" state={campo("correo_electronico")} mensajeError={mensaje("correo_electronico")} {...form.register("correo_electronico")} />
        <FloatingInput
          leftIcon={<Phone className="size-4" aria-hidden="true" />} label="Teléfono (opcional)" type="tel" autoComplete="tel" state={campo("telefono")} mensajeError={mensaje("telefono")} {...form.register("telefono")} />
        <CampoContrasena
          label="Contraseña"
          autoComplete="new-password"
          ayuda="Entre 8 y 72 caracteres, con letras y números."
          state={campo("contrasena")}
          mensajeError={mensaje("contrasena")}
          {...form.register("contrasena")}
        />

        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-brand-text hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
