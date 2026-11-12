"use client"

import * as React from "react"
import { Mail, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { OtpInput } from "../components/otp-input"
import { useCuentaRegresiva } from "../hooks/use-cuenta-regresiva"
import { desbloquearAction } from "../actions/auth.actions"
import { codigoSchema, recuperarSolicitarSchema, type RecuperarSolicitarValues } from "../schema"
import type { ErrorApi } from "@/lib/api/error-api"

/**
 * Desbloqueo de la cuenta tras 5 intentos fallidos (A-007, USR-014): correo + el código de 6 dígitos que llegó al correo
 * (vale 30 minutos). El formulario solo valida el correo; el código se valida aparte con `codigoSchema` porque su campo está fuera del
 * formulario (si no, `handleSubmit` lo daría siempre por vacío y no llegaría a enviar).
 */
export function DesbloquearCuentaView({ correo }: { correo?: string }) {
  const router = useRouter()
  const [codigo, setCodigo] = React.useState("")
  const [errorCodigo, setErrorCodigo] = React.useState<string | undefined>()
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const espera = useCuentaRegresiva()

  const form = useForm<RecuperarSolicitarValues>({
    resolver: zodResolver(recuperarSolicitarSchema),
    defaultValues: { correo_electronico: correo ?? "" },
  })

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const parsed = codigoSchema.safeParse(codigo)
    if (!parsed.success) {
      setErrorCodigo(parsed.error.issues[0]?.message)
      return
    }
    setErrorCodigo(undefined)
    setEnviando(true)
    const res = await desbloquearAction(valores.correo_electronico, codigo)
    setEnviando(false)
    if (res.ok) {
      router.replace(`/login?correo=${encodeURIComponent(valores.correo_electronico)}&aviso=desbloqueada`)
      return
    }
    setCodigo("")
    if (res.error.codigo === "USR-012") return setErrorCodigo("El código no es válido o venció.")
    setError(res.error)
    if (res.error.estado === 429) espera.iniciar(res.error.retryAfterSegundos ?? 60)
  })

  const bloqueado = espera.restan > 0

  return (
    <div className="otemu-auth-fields space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Desbloquea tu cuenta</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Escribe el código de 6 dígitos que te enviamos por correo cuando se bloqueó tu cuenta. Vale 30 minutos.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>No pudimos desbloquear tu cuenta</AlertTitle>
          <AlertDescription>
            {error.message}
            {error.estado === 429 && bloqueado && ` Intenta de nuevo en ${espera.restan} s.`}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={enviar} noValidate className="space-y-6">
        <FloatingInput
          leftIcon={<Mail className="size-4" aria-hidden="true" />}
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          state={form.formState.errors.correo_electronico ? "error" : "default"}
          mensajeError={form.formState.errors.correo_electronico?.message}
          {...form.register("correo_electronico")}
        />

        <div className="space-y-2">
          <p className="text-[13px] font-bold text-foreground">Código de desbloqueo</p>
          <OtpInput value={codigo} onChange={setCodigo} disabled={enviando} />
          {errorCodigo && (
            <p className="text-[11px] font-bold text-destructive-text" role="alert">
              {errorCodigo}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={enviando} disabled={bloqueado}>
          {bloqueado ? `Espera ${espera.restan} s` : "Desbloquear cuenta"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-[13px] text-muted-foreground">
        <p className="text-center">
          Si no tienes el código, también puedes{" "}
          <Link href="/recuperar" className="font-bold text-brand-text hover:underline">
            restablecer tu contraseña
          </Link>
          : eso desbloquea la cuenta.
        </p>
        <Link href="/login" className="font-bold text-brand-text hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  )
}
