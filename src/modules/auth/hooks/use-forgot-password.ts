"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { toastResponse } from "@/shared/utils/toast-response"
import {
  restablecerPasswordAction,
  solicitarRecuperacionAction,
  verificarOtpAction,
} from "../actions/auth.actions"
import { recuperarSchema, type RecuperarValues } from "../schema"

export type ForgotPasswordStep = "email" | "code" | "password"

// El backend ignora una nueva solicitud si la anterior tiene menos de 60 s.
const COOLDOWN_REENVIO_SEGUNDOS = 60

export function useForgotPassword() {
  const router = useRouter()
  const [step, setStep] = React.useState<ForgotPasswordStep>("email")
  const [email, setEmail] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  // Token de un solo uso entregado tras validar el OTP; vive solo en memoria.
  const [resetToken, setResetToken] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [resendCooldown, setResendCooldown] = React.useState(0)

  const emailForm = useForm<RecuperarValues>({
    resolver: zodResolver(recuperarSchema),
    defaultValues: { email: "" },
  })

  const cooldownActivo = resendCooldown > 0
  React.useEffect(() => {
    if (!cooldownActivo) return
    const intervalo = setInterval(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearInterval(intervalo)
  }, [cooldownActivo])

  const pedirCodigo = async (correo: string): Promise<boolean> => {
    setIsLoading(true)
    // La respuesta es genérica (no revela si el correo existe): siempre se informa lo mismo.
    const res = await toastResponse(solicitarRecuperacionAction(correo), {
      loading: "Enviando código...",
      success: "Revisa tu correo",
      successDescription: "Si el correo está registrado, recibirás un código de 6 dígitos.",
      error: "No se pudo enviar el código",
    })
    setIsLoading(false)
    return res.isOk()
  }

  // Paso 1: correo -> código
  const submitEmail = emailForm.handleSubmit(async ({ email: correo }) => {
    if (isLoading || !(await pedirCodigo(correo))) return
    setEmail(correo)
    setOtpCode("")
    setResendCooldown(COOLDOWN_REENVIO_SEGUNDOS)
    setStep("code")
  })

  const resend = async () => {
    if (resendCooldown > 0 || isLoading) return
    if (!(await pedirCodigo(email))) return
    setOtpCode("")
    setResendCooldown(COOLDOWN_REENVIO_SEGUNDOS)
  }

  // Paso 2: valida el OTP (6 dígitos) contra el backend.
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6 || isLoading) return
    setIsLoading(true)
    const res = await toastResponse(verificarOtpAction(email, otpCode), {
      loading: "Verificando código...",
      success: "Código verificado",
      error: "No se pudo verificar el código",
    })
    setIsLoading(false)

    if (!res.isOk()) return setOtpCode("")
    setResetToken(res.data.token_restablecimiento)
    setStep("password")
  }

  // Paso 3: fija la nueva contraseña.
  const submitPassword = async (password: string): Promise<void> => {
    if (!resetToken) {
      setStep("email")
      return
    }
    const res = await toastResponse(restablecerPasswordAction(resetToken, password), {
      loading: "Restableciendo contraseña...",
      success: "Contraseña actualizada",
      successDescription: "Inicia sesión con tu nueva contraseña.",
      error: "No se pudo restablecer la contraseña",
    })

    if (res.isOk()) {
      router.replace("/login")
    } else if (res.httpStatusCode === 400) {
      // Token vencido o ya usado: hay que empezar de nuevo.
      setResetToken(null)
      setStep("email")
    }
  }

  const backToEmail = () => setStep("email")

  return {
    step,
    email,
    emailForm,
    otpCode,
    setOtpCode,
    isLoading,
    resendCooldown,
    submitEmail,
    submitCode,
    submitPassword,
    resend,
    backToEmail,
  }
}
