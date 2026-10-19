"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { Mail, Lock, Eye, EyeOff, Coffee } from "lucide-react"
import { toast } from "@/shared/components/ui/toast"
import { useLogin } from "../hooks/use-login"
import { SesionActivaModal } from "../components/sesion-activa-modal"

interface LoginViewProps {
  /** Ruta a la que volver tras iniciar sesión (la fija el Proxy al redirigir), vía ?siguiente= */
  siguiente?: string
  /** Por qué se volvió al login: se avisa con un toast (inactividad o sesión reemplazada desde otro navegador). */
  motivo?: "inactividad" | "reemplazada"
}

export function LoginView({ siguiente, motivo }: LoginViewProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)

  // Se volvió al login por un cierre de sesión: se explica con un toast y se limpia la dirección para no repetirlo al recargar.
  const avisado = React.useRef(false)
  React.useEffect(() => {
    if (!motivo || avisado.current) return
    avisado.current = true
    if (motivo === "inactividad") {
      toast.add({
        type: "warning",
        title: "Tu sesión se cerró por inactividad",
        description: "Ingresa de nuevo para continuar.",
        timeout: 8000,
      })
    } else {
      toast.add({
        type: "error",
        title: "Tu sesión se cerró",
        description: (
          <>
            Se inició sesión con tu cuenta en otro dispositivo o navegador. Si no fuiste tú,{" "}
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="cursor-pointer font-semibold text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              cambia tu contraseña
            </button>
            .
          </>
        ),
        timeout: 15000,
      })
    }
    router.replace("/login")
  }, [motivo, router])

  const { form, submit, bloqueoSegundos, sesionActiva } = useLogin(siguiente)
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const bloqueado = bloqueoSegundos > 0

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
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="space-y-1">
          <FloatingInput
            label="Correo Electrónico"
            type="email"
            leftIcon={<Mail size={18} />}
            state={errors.email ? "error" : "default"}
            disabled={isSubmitting}
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className="px-2 text-[11px] text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <FloatingInput
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="flex items-center justify-center text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            state={errors.password ? "error" : "default"}
            disabled={isSubmitting}
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && <p className="px-2 text-[11px] text-red-600">{errors.password.message}</p>}
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
          disabled={isSubmitting || bloqueado}
          className="mt-2 w-full font-semibold shadow-sm cursor-pointer"
        >
          <span>
            {bloqueado ? `Reintentar en ${bloqueoSegundos}s` : "Iniciar Sesión"}
          </span>
        </Button>
      </form>

      <SesionActivaModal
        open={sesionActiva.abierta}
        enviando={sesionActiva.enviando}
        onContinuar={() => void sesionActiva.continuar()}
        onCancelar={sesionActiva.cancelar}
        onNoSoyYo={sesionActiva.noSoyYo}
      />
    </div>
  )
}
