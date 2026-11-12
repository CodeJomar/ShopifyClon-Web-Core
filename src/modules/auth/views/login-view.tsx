"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheck, Mail, TriangleAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import { CampoContrasena } from "../components/campo-contrasena"
import { OtpInput } from "../components/otp-input"
import { useCuentaRegresiva } from "../hooks/use-cuenta-regresiva"
import { loginAction, verificarSegundoFactorAction } from "../actions/auth.actions"
import { codigoSchema, loginSchema, type LoginValues } from "../schema"
import { destinoSeguro } from "../utils"
import type { ErrorApi } from "@/lib/api/error-api"
import type { LoginDatosDto } from "@/dtos/auth"

/** Avisos que otras pantallas dejan al mandar a la persona al login (`?aviso=`). */
const AVISOS = {
  contrasena: "Contraseña actualizada. Vuelve a iniciar sesión.",
  desbloqueada: "Cuenta desbloqueada, ya puedes iniciar sesión.",
  sesiones: "Cerramos tu sesión en todos los dispositivos. Vuelve a iniciar sesión cuando quieras.",
} as const

interface LoginViewProps {
  correo?: string
  siguiente?: string
  aviso?: string
}

export function LoginView({ correo, siguiente, aviso }: LoginViewProps) {
  const router = useRouter()
  const [error, setError] = React.useState<ErrorApi | null>(null)
  // Dos pasos (A-007): tras la contraseña, si la cuenta lo tiene activo, se pide el código que llegó al correo.
  const [paso, setPaso] = React.useState<"credenciales" | "codigo">("credenciales")
  const [codigo, setCodigo] = React.useState("")
  const [errorCodigo, setErrorCodigo] = React.useState<string | undefined>()
  const [verificando, setVerificando] = React.useState(false)
  const textoAviso = aviso && aviso in AVISOS ? AVISOS[aviso as keyof typeof AVISOS] : null
  const espera = useCuentaRegresiva()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo_electronico: correo ?? "", contrasena: "" },
  })

  /** Sesión iniciada (login normal o segundo paso): aviso y destino según las tiendas de la persona. */
  const entrar = (datos: LoginDatosDto) => {
    toast.add({ type: "success", title: "Sesión iniciada", description: "Bienvenido de nuevo." })
    // Sin "siguiente": administrador de plataforma sin tiendas → /plataforma; 0 tiendas → crear la primera; 1 → su panel; varias → elegir.
    const tiendas = datos.tiendas.length
    const esAdminPlataforma = Boolean(datos.usuario.es_administrador_plataforma)
    const destinoPorDefecto =
      esAdminPlataforma && tiendas === 0
        ? "/plataforma"
        : tiendas === 0
        ? "/cuenta/tiendas/nueva"
        : tiendas === 1
        ? "/panel"
        : "/cuenta/tiendas"
    router.replace(siguiente ? destinoSeguro(siguiente) : destinoPorDefecto)
  }

  const verificar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const parsed = codigoSchema.safeParse(codigo)
    if (!parsed.success) return setErrorCodigo(parsed.error.issues[0]?.message)
    setErrorCodigo(undefined)
    setVerificando(true)
    const res = await verificarSegundoFactorAction(form.getValues("correo_electronico"), codigo)
    setVerificando(false)
    if (res.ok) return entrar(res.datos)
    setCodigo("")
    if (res.error.codigo === "USR-012") return setErrorCodigo("El código no es válido o venció.")
    setError(res.error)
    if (res.error.estado === 429) espera.iniciar(res.error.retryAfterSegundos ?? 60)
  }

  const volverAContrasena = () => {
    setPaso("credenciales")
    setCodigo("")
    setErrorCodigo(undefined)
    setError(null)
  }

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await loginAction(valores.correo_electronico, valores.contrasena)
    if (res.ok) {
      if (res.datos.requiere_segundo_factor === true) {
        // Todavía no hay sesión: la API mandó un código al correo. La contraseña ya no se necesita.
        form.resetField("contrasena")
        setCodigo("")
        setErrorCodigo(undefined)
        setPaso("codigo")
        toast.add({ type: "info", title: "Código enviado", description: "Te enviamos un código a tu correo para terminar de iniciar sesión." })
        return
      }
      entrar(res.datos)
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
  const cuentaBloqueada = error?.codigo === "USR-014"

  if (paso === "codigo") {
    return (
      <div className="otemu-auth-fields space-y-6">
        <div>
          <h1 className="text-[29px] font-extrabold tracking-tight text-foreground">Revisa tu correo</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Escribe el código de 6 dígitos que enviamos a <span className="font-bold text-foreground">{form.getValues("correo_electronico")}</span> para terminar de iniciar sesión.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>No pudimos verificar tu código</AlertTitle>
            <AlertDescription>
              {error.message}
              {error.estado === 429 && bloqueado && ` Intenta de nuevo en ${espera.restan} s.`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={verificar} noValidate className="space-y-6">
          <div className="space-y-2">
            <p className="text-[13px] font-bold text-foreground">Código de verificación</p>
            <OtpInput value={codigo} onChange={setCodigo} disabled={verificando} />
            {errorCodigo && <p className="text-[11px] font-bold text-destructive-text" role="alert">{errorCodigo}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" loading={verificando} disabled={bloqueado}>
            {bloqueado ? `Espera ${espera.restan} s` : "Verificar y entrar"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 text-center text-[13px] text-muted-foreground">
          <p>El código vence en 10 minutos. Para pedir otro, vuelve y escribe tu contraseña de nuevo.</p>
          <Button type="button" variant="ghost" size="sm" onClick={volverAContrasena}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="otemu-auth-fields space-y-6">
      <div>
        <h1 className="text-[29px] font-extrabold tracking-tight text-foreground">Inicia sesión</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Entra a tu cuenta de OTemu.</p>
      </div>

      {textoAviso && !error && (
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertDescription>{textoAviso}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>{error.codigo === "USR-003" ? "Tu cuenta no está activada" : cuentaBloqueada ? "Tu cuenta está bloqueada" : "No pudimos iniciar sesión"}</AlertTitle>
          <AlertDescription>
            {cuentaBloqueada
              ? "Tu cuenta está bloqueada temporalmente por varios intentos fallidos. Revisa tu correo para desbloquearla o inténtalo en 15 minutos."
              : error.message}
            {error.estado === 429 && bloqueado && ` Intenta de nuevo en ${espera.restan} s.`}
          </AlertDescription>
          {cuentaBloqueada && (
            <Button variant="soft" size="sm" className="mt-2" type="button" onClick={() => router.push(`/desbloquear?correo=${encodeURIComponent(form.getValues("correo_electronico"))}`)}>
              Tengo un código de desbloqueo
            </Button>
          )}
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
