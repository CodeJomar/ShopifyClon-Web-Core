"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Coffee, ArrowLeft, ShieldCheck } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { OtpInput } from "@/modules/auth/components/otp-input"
import { cn } from "@/shared/utils/cn"

type Step = "email" | "code" | "password"

export function ForgotPasswordView() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState<Step>("email")

  // Estados del formulario
  const [email, setEmail] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [resendCooldown, setResendCooldown] = React.useState(0)

  // Timer para reenvío de código
  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  // Paso 1: Enviar Correo
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setResendCooldown(30)
      setCurrentStep("code")
    }, 800)
  }

  // Paso 2: Verificar Código OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 6) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("password")
    }, 800)
  }

  // Paso 2: Reenviar Código
  const handleResend = () => {
    if (resendCooldown > 0 || isLoading) return
    setResendCooldown(30)
  }

  // Paso 3: Restablecer Contraseña
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/login")
    }, 1000)
  }

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
          {currentStep === "email" && "Recuperación de Contraseña"}
          {currentStep === "code" && "Código de Verificación"}
          {currentStep === "password" && "Crear Nueva Contraseña"}
        </p>
      </div>

      {/* ======================= PASO 1: CORREO ======================= */}
      {currentStep === "email" && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-slate-600 dark:text-stone-400 text-center leading-relaxed">
            Ingresa tu correo asociado a tu cuenta para enviarte un código de seguridad.
          </p>

          <FloatingInput
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={18} />}
            disabled={isLoading}
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            variant="default"
            size="md"
            loading={isLoading}
            className="mt-2 w-full font-semibold shadow-sm cursor-pointer"
          >
            <span>{isLoading ? "Enviando..." : "Enviar Código"}</span>
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

      {/* ======================= PASO 2: CÓDIGO (Diseño de la imagen) ======================= */}
      {currentStep === "code" && (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          {/* Componente de las 6 Casillas de Código */}
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            disabled={isLoading}
          />

          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed px-2">
              Ingresa el código de 6 dígitos que enviamos a{" "}
              <span className="font-semibold text-slate-700 dark:text-stone-200">{email}</span>.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="default"
              size="md"
              disabled={otpCode.length < 6 || isLoading}
              loading={isLoading}
              className="w-full font-semibold shadow-sm cursor-pointer"
            >
              <span>{isLoading ? "Verificando..." : "Verificar Código"}</span>
            </Button>

            {/* Botón Reenviar (Resend) con cooldown */}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className={cn(
                "text-xs font-semibold text-[#4C0107] dark:text-stone-300 py-1 transition-opacity",
                resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline cursor-pointer"
              )}
            >
              {resendCooldown > 0 ? `Reenviar código en ${resendCooldown}s` : "Reenviar código (Resend)"}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCurrentStep("email")}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#4C0107] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Corregir correo
            </button>
          </div>
        </form>
      )}

      {/* ======================= PASO 3: NUEVA CONTRASEÑA ======================= */}
      {currentStep === "password" && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <p className="text-xs text-slate-600 dark:text-stone-400 text-center leading-relaxed">
            Ingresa y confirma tu nueva credencial de acceso.
          </p>

          <FloatingInput
            label="Nueva Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                className="flex items-center justify-center text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            disabled={isLoading}
            autoComplete="new-password"
            required
          />

          <FloatingInput
            label="Confirmar Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<ShieldCheck size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
                className="flex items-center justify-center text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            disabled={isLoading}
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="default"
            size="md"
            loading={isLoading}
            className="mt-2 w-full font-semibold shadow-sm cursor-pointer"
          >
            <span>{isLoading ? "Restableciendo..." : "Restablecer y Entrar"}</span>
          </Button>
        </form>
      )}
    </div>
  )
}