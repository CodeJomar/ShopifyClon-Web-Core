"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { nuevaPasswordSchema, type NuevaPasswordValues } from "../schema"

interface NewPasswordFormProps {
  /** Texto introductorio sobre los campos. */
  description: string
  submitLabel: string
  /** Ejecuta la operación; el resultado (éxito o error) lo comunica quien llama con un toast. */
  onSubmit: (password: string) => Promise<void>
}

/** Formulario de contraseña nueva + confirmación (activación de cuenta y recuperación). */
export function NewPasswordForm({ description, submitLabel, onSubmit }: NewPasswordFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NuevaPasswordValues>({
    resolver: zodResolver(nuevaPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const submit = handleSubmit(async ({ password }) => {
    if (isSubmitting) return
    await onSubmit(password)
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <p className="text-xs text-slate-600 dark:text-stone-400 text-center leading-relaxed">{description}</p>

      <div className="space-y-1">
        <FloatingInput
          label="Nueva Contraseña"
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
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="px-2 text-[11px] text-red-600">{errors.password.message}</p>
        ) : (
          <p className="px-2 text-[11px] text-slate-400">Mínimo 8 caracteres, con letras, números y un símbolo.</p>
        )}
      </div>

      <div className="space-y-1">
        <FloatingInput
          label="Confirmar Contraseña"
          type={showConfirmPassword ? "text" : "password"}
          leftIcon={<ShieldCheck size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="flex items-center justify-center text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          state={errors.confirmPassword ? "error" : "default"}
          disabled={isSubmitting}
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <p className="px-2 text-[11px] text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      <Button
        type="submit"
        variant="default"
        size="md"
        disabled={isSubmitting}
        className="mt-2 w-full font-semibold shadow-sm cursor-pointer"
      >
        <span>{submitLabel}</span>
      </Button>
    </form>
  )
}
