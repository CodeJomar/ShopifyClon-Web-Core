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
import { OtpInput } from "../components/otp-input"
import { useCuentaRegresiva } from "../hooks/use-cuenta-regresiva"
import { activarAction, reenviarActivacionAction } from "../actions/auth.actions"
import { activarSchema, type ActivarValues } from "../schema"
import type { ErrorApi } from "@/lib/api/error-api"

export function ActivarCuentaView({ correo }: { correo?: string }) {
  const router = useRouter()
  const [codigo, setCodigo] = React.useState("")
  const [errorCodigo, setErrorCodigo] = React.useState<string | undefined>()
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const espera = useCuentaRegresiva()

  const form = useForm<ActivarValues>({
    resolver: zodResolver(activarSchema),
    defaultValues: { correo_electronico: correo ?? "", codigo: "" },
  })

  const enviar = form.handleSubmit(async (valores) => {
    setError(null)
    const parsed = activarSchema.safeParse({ ...valores, codigo })
    if (!parsed.success) {
      setErrorCodigo(parsed.error.issues.find((i) => i.path[0] === "codigo")?.message)
      return
    }
    setErrorCodigo(undefined)
    setEnviando(true)
    const res = await activarAction(valores.correo_electronico, codigo)
    setEnviando(false)
    if (res.ok) {
      toast.add({ type: "success", title: "Cuenta activada", description: "Ya puedes iniciar sesión." })
      router.replace(`/login?correo=${encodeURIComponent(valores.correo_electronico)}`)
      return
    }
    setError(res.error)
    setCodigo("")
  })

  const reenviar = async () => {
    const correoActual = form.getValues("correo_electronico")
    const parsed = activarSchema.shape.correo_electronico.safeParse(correoActual)
    if (!parsed.success) {
      form.setError("correo_electronico", { message: parsed.error.issues[0]?.message })
      return
    }
    const res = await reenviarActivacionAction(correoActual)
    if (res.ok) {
      toast.add({ type: "info", title: "Código enviado", description: res.mensaje || "Revisa tu correo." })
      espera.iniciar(60)
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Activa tu cuenta</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Escribe el código de 6 dígitos que te enviamos por correo.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos activar tu cuenta</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={enviar} noValidate className="space-y-6">
        <FloatingInput
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          state={form.formState.errors.correo_electronico ? "error" : "default"}
          mensajeError={form.formState.errors.correo_electronico?.message}
          {...form.register("correo_electronico")}
        />

        <div className="space-y-2">
          <p className="text-[13px] font-bold text-foreground">Código de activación</p>
          <OtpInput value={codigo} onChange={(valor: string) => setCodigo(valor)} disabled={enviando} />
          {errorCodigo && <p className="text-[11px] font-bold text-destructive-text">{errorCodigo}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={enviando}>
          Activar cuenta
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-[13px] text-muted-foreground">
        <Button type="button" variant="ghost" size="sm" disabled={espera.restan > 0} onClick={reenviar}>
          {espera.restan > 0 ? `Reenviar código en ${espera.restan} s` : "Reenviar código"}
        </Button>
        <Link href="/login" className="font-bold text-brand-text hover:underline">
          Ya tengo cuenta activa
        </Link>
      </div>
    </div>
  )
}
