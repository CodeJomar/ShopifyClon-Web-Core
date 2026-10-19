"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Coffee, ArrowLeft } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { OtpInput } from "@/modules/auth/components/otp-input"
import { NewPasswordForm } from "@/modules/auth/components/new-password-form"
import { useForgotPassword } from "@/modules/auth/hooks/use-forgot-password"
import { cn } from "@/shared/utils/cn"

export function ForgotPasswordView() {
  const {
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
  } = useForgotPassword()

  const {
    register,
    formState: { errors: emailErrors },
  } = emailForm

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Cabecera idéntica al Login */}
      <div className="flex flex-col items-center text-center gap-2 select-none">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#4C0107] text-white shadow-sm">
          <Coffee size={30} strokeWidth={2.2} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-stone-100 tracking-tight">
          Coffy Flow
        </h1>
        <p className="text-xs text-slate-500 dark:text-stone-400 font-medium">
          {step === "email" && "Recuperación de Contraseña"}
          {step === "code" && "Código de Verificación"}
          {step === "password" && "Crear Nueva Contraseña"}
        </p>
      </div>

      {/* ======================= PASO 1: CORREO ======================= */}
      {step === "email" && (
        <form onSubmit={submitEmail} className="flex flex-col gap-4" noValidate>
          <p className="text-xs text-slate-600 dark:text-stone-400 text-center leading-relaxed">
            Ingresa tu correo asociado a tu cuenta para enviarte un código de seguridad.
          </p>

          <div className="space-y-1">
            <FloatingInput
              label="Correo Electrónico"
              type="email"
              leftIcon={<Mail size={18} />}
              state={emailErrors.email ? "error" : "default"}
              disabled={isLoading}
              autoComplete="email"
              {...register("email")}
            />
            {emailErrors.email && <p className="px-2 text-[11px] text-red-600">{emailErrors.email.message}</p>}
          </div>

          <Button
            type="submit"
            variant="default"
            size="md"
            disabled={isLoading}
            className="mt-2 w-full font-semibold shadow-sm cursor-pointer"
          >
            <span>Enviar Código</span>
          </Button>

          <div className="flex justify-center pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#4C0107] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver a Iniciar Sesión
            </Link>
          </div>
        </form>
      )}

      {/* ======================= PASO 2: CÓDIGO ======================= */}
      {step === "code" && (
        <form onSubmit={submitCode} className="flex flex-col gap-6">
          {/* Componente de las 6 Casillas de Código */}
          <OtpInput value={otpCode} onChange={setOtpCode} disabled={isLoading} />

          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed px-2">
              Si el correo{" "}
              <span className="font-semibold text-slate-700 dark:text-stone-200">{email}</span>{" "}
              está registrado, enviamos un código de 6 dígitos. Vence en 10 minutos.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="default"
              size="md"
              disabled={otpCode.length < 6 || isLoading}
              className="w-full font-semibold shadow-sm cursor-pointer"
            >
              <span>Verificar Código</span>
            </Button>

            {/* Botón Reenviar con cooldown */}
            <button
              type="button"
              onClick={resend}
              disabled={resendCooldown > 0 || isLoading}
              className={cn(
                "text-xs font-semibold text-[#4C0107] dark:text-stone-300 py-1 transition-opacity",
                resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline cursor-pointer"
              )}
            >
              {resendCooldown > 0 ? `Reenviar código en ${resendCooldown}s` : "Reenviar código"}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={backToEmail}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#4C0107] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Corregir correo
            </button>
          </div>
        </form>
      )}

      {/* ======================= PASO 3: NUEVA CONTRASEÑA ======================= */}
      {step === "password" && (
        <NewPasswordForm
          description="Ingresa y confirma tu nueva credencial de acceso."
          submitLabel="Restablecer Contraseña"
          onSubmit={submitPassword}
        />
      )}
    </div>
  )
}
