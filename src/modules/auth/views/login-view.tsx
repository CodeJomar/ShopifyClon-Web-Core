"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, TriangleAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import { CampoContrasena } from "../components/campo-contrasena"
import { useCuentaRegresiva } from "../hooks/use-cuenta-regresiva"
import { loginAction } from "../actions/auth.actions"
import { loginSchema, type LoginValues } from "../schema"
import { destinoSeguro } from "../utils"
import type { ErrorApi } from "@/lib/api/error-api"

interface LoginViewProps {
  correo?: string
  siguiente?: string
}

export function LoginView({ correo, siguiente }: LoginViewProps) {
  const router = useRouter()
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const espera = useCuentaRegresiva()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo_electronico: correo ?? "", contrasena: "" },
  })

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await loginAction(valores.correo_electronico, valores.contrasena)
    if (res.ok) {
      toast.add({ type: "success", title: "Sesión iniciada", description: "Bienvenido de nuevo." })
      // Sin "siguiente": administrador de plataforma sin tiendas → /plataforma; 0 tiendas → crear la primera; 1 → su panel; varias → elegir.
      const tiendas = res.datos.tiendas.length
      const esAdminPlataforma = Boolean(res.datos.usuario.es_administrador_plataforma)
      const destinoPorDefecto =
        esAdminPlataforma && tiendas === 0
          ? "/plataforma"
          : tiendas === 0
          ? "/cuenta/tiendas/nueva"
          : tiendas === 1
          ? "/panel"
          : "/cuenta/tiendas"
      router.replace(siguiente ? destinoSeguro(siguiente) : destinoPorDefecto)
      return
    }
    const e = res.error
    for (const [campo, mensaje] of Object.entries(e.validaciones ?? {})) {
      form.setError(campo as keyof LoginValues, { message: mensaje })
    }
    setError(e)
    form.resetField("contrasena")
    if (e.estado === 429) espera.iniciar(e.retryAfterSegundos ?? 60)
  })

  const bloqueado = espera.restan > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Inicia sesión</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Entra a tu cuenta de OTemu.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>{error.codigo === "USR-003" ? "Tu cuenta no está activada" : "No pudimos iniciar sesión"}</AlertTitle>
          <AlertDescription>
            {error.message}
            {error.estado === 429 && bloqueado && ` Intenta de nuevo en ${espera.restan} s.`}
          </AlertDescription>
          {error.codigo === "USR-003" && (
            <Button variant="soft" size="sm" className="mt-2" type="button" onClick={() => router.push(`/activar-cuenta?correo=${encodeURIComponent(form.getValues("correo_electronico"))}`)}>
              Activar mi cuenta
            </Button>
          )}
        </Alert>
      )}

      <form onSubmit={enviar} noValidate className="space-y-5">
        <FloatingInput
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          leftIcon={<Mail className="size-4" aria-hidden="true" />}
          state={form.formState.errors.correo_electronico ? "error" : "default"}
          mensajeError={form.formState.errors.correo_electronico?.message}
          {...form.register("correo_electronico")}
        />
        <CampoContrasena
          label="Contraseña"
          state={form.formState.errors.contrasena ? "error" : "default"}
          mensajeError={form.formState.errors.contrasena?.message}
          {...form.register("contrasena")}
        />

        <div className="flex justify-end">
          <Link href="/recuperar" className="text-[12px] font-bold text-brand-text hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting} disabled={bloqueado}>
          {bloqueado ? `Espera ${espera.restan} s` : "Iniciar sesión"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold text-brand-text hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
