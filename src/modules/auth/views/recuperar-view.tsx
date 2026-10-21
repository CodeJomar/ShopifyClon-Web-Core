"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import { CampoContrasena } from "../components/campo-contrasena"
import { OtpInput } from "../components/otp-input"
import { confirmarRecuperacionAction, solicitarRecuperacionAction } from "../actions/auth.actions"
import {
  recuperarConfirmarSchema,
  recuperarSolicitarSchema,
  type RecuperarConfirmarValues,
  type RecuperarSolicitarValues,
} from "../schema"
import type { ErrorApi } from "@/lib/api/error-api"

export function RecuperarView() {
  const router = useRouter()
  const [paso, setPaso] = React.useState<"correo" | "codigo">("correo")
  const [correo, setCorreo] = React.useState("")
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [codigo, setCodigo] = React.useState("")
  const [errorCodigo, setErrorCodigo] = React.useState<string | undefined>()

  const formCorreo = useForm<RecuperarSolicitarValues>({
    resolver: zodResolver(recuperarSolicitarSchema),
    defaultValues: { correo_electronico: "" },
  })
  const formNueva = useForm<RecuperarConfirmarValues>({
    resolver: zodResolver(recuperarConfirmarSchema),
    defaultValues: { codigo: "", contrasena_nueva: "", confirmar: "" },
  })

  // La API responde 200 aunque el correo no exista (USR-005): no se revela si la cuenta existe.
  const pedirCodigo = formCorreo.handleSubmit(async (valores) => {
    setError(null)
    const res = await solicitarRecuperacionAction(valores.correo_electronico)
    if (!res.ok) return setError(res.error)
    setCorreo(valores.correo_electronico)
    setPaso("codigo")
    toast.add({ type: "info", title: "Revisa tu correo", description: "Si la cuenta existe, te enviamos un código de 6 dígitos." })
  })

  const cambiarClave = formNueva.handleSubmit(async (valores) => {
    setError(null)
    const parsed = recuperarConfirmarSchema.safeParse({ ...valores, codigo })
    if (!parsed.success) {
      setErrorCodigo(parsed.error.issues.find((i) => i.path[0] === "codigo")?.message)
      return
    }
    setErrorCodigo(undefined)
    const res = await confirmarRecuperacionAction(correo, codigo, valores.contrasena_nueva)
    if (res.ok) {
      toast.add({ type: "success", title: "Contraseña actualizada", description: "Ya puedes iniciar sesión." })
      router.replace(`/login?correo=${encodeURIComponent(correo)}`)
      return
    }
    setError(res.error)
    setCodigo("")
    formNueva.resetField("contrasena_nueva")
    formNueva.resetField("confirmar")
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Recupera tu contraseña</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {paso === "correo" ? "Te enviaremos un código a tu correo." : `Escribe el código que enviamos a ${correo}.`}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos continuar</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {paso === "correo" ? (
        <form onSubmit={pedirCodigo} noValidate className="space-y-5">
          <FloatingInput
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            state={formCorreo.formState.errors.correo_electronico ? "error" : "default"}
            mensajeError={formCorreo.formState.errors.correo_electronico?.message}
            {...formCorreo.register("correo_electronico")}
          />
          <Button type="submit" className="w-full" size="lg" loading={formCorreo.formState.isSubmitting}>
            Enviar código
          </Button>
        </form>
      ) : (
        <form onSubmit={cambiarClave} noValidate className="space-y-6">
          <div className="space-y-2">
            <p className="text-[13px] font-bold text-foreground">Código de 6 dígitos</p>
            <OtpInput value={codigo} onChange={(valor: string) => setCodigo(valor)} disabled={formNueva.formState.isSubmitting} />
            {errorCodigo && <p className="text-[11px] font-bold text-destructive-text">{errorCodigo}</p>}
          </div>
          <CampoContrasena
            label="Contraseña nueva"
            autoComplete="new-password"
            ayuda="Entre 8 y 72 caracteres, con letras y números."
            state={formNueva.formState.errors.contrasena_nueva ? "error" : "default"}
            mensajeError={formNueva.formState.errors.contrasena_nueva?.message}
            {...formNueva.register("contrasena_nueva")}
          />
          <CampoContrasena
            label="Confirma la contraseña"
            autoComplete="new-password"
            state={formNueva.formState.errors.confirmar ? "error" : "default"}
            mensajeError={formNueva.formState.errors.confirmar?.message}
            {...formNueva.register("confirmar")}
          />
          <Button type="submit" className="w-full" size="lg" loading={formNueva.formState.isSubmitting}>
            Cambiar contraseña
          </Button>
        </form>
      )}

      <p className="text-center text-[13px] text-muted-foreground">
        <Link href="/login" className="font-bold text-brand-text hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
