"use client"

import * as React from "react"
import Link from "next/link"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { Mail, Lock, Eye, EyeOff, Coffee } from "lucide-react"

export function LoginView() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Identidad Coffy Flow con Icono de Café */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#4C0107] text-white shadow-sm">
          <Coffee size={30} strokeWidth={2.2} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Coffy Flow
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Acceso de Personal
        </p>
      </div>

      {/* Formulario utilizando FloatingInput y Button base */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <div className="space-y-1">
          <FloatingInput
            label="Contraseña"
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
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-slate-500 hover:text-[#4C0107] transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="md"
          loading={isLoading}
          className="mt-2 w-full font-semibold shadow-sm cursor-pointer"
        >
          <span>{isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}</span>
        </Button>
      </form>
    </div>
  )
}