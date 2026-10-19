"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"

import { cambiarPasswordSchema, type CambiarPasswordValues } from "../schema"
import { descripcionTarjeta, errorClass, tarjetaPerfil, tituloTarjeta } from "./estilos"

/** Ojito para ver u ocultar lo escrito en un campo de contraseña. */
function OjoPassword({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="flex items-center justify-center text-slate-400 hover:text-slate-600 outline-none cursor-pointer"
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}

const VACIO: CambiarPasswordValues = { passwordActual: "", passwordNueva: "", confirmar: "" }

/** Cambio de contraseña: pide la actual; al guardar se cierran las demás sesiones. */
export function PasswordForm({
  onCambiar,
}: {
  // Devuelve true si se cambió (entonces el formulario se limpia)
  onCambiar: (values: CambiarPasswordValues) => Promise<boolean>
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CambiarPasswordValues>({ resolver: zodResolver(cambiarPasswordSchema), defaultValues: VACIO })
  const [ver, setVer] = React.useState({ actual: false, nueva: false, confirmar: false })
  const alternar = (campo: keyof typeof ver) => setVer((v) => ({ ...v, [campo]: !v[campo] }))

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (await onCambiar(values)) reset(VACIO)
      })}
      noValidate
      className={tarjetaPerfil}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className={tituloTarjeta}>Cambiar contraseña</h3>
        <p className={descripcionTarjeta}>Mínimo 8 caracteres con letras, números y un símbolo. Se cerrarán tus sesiones en otros dispositivos.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FloatingInput
          id="perfil-password-actual"
          label="Contraseña actual"
          type={ver.actual ? "text" : "password"}
          rightIcon={<OjoPassword visible={ver.actual} onToggle={() => alternar("actual")} />}
          leftIcon={<Lock size={18} />}
          {...register("passwordActual")}
          autoComplete="current-password"
          state={errors.passwordActual ? "error" : "default"}
          aria-invalid={Boolean(errors.passwordActual)}
        />
        {errors.passwordActual && <p className={errorClass}>{errors.passwordActual.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="perfil-password-nueva"
            label="Contraseña nueva"
            type={ver.nueva ? "text" : "password"}
            rightIcon={<OjoPassword visible={ver.nueva} onToggle={() => alternar("nueva")} />}
            leftIcon={<KeyRound size={18} />}
            {...register("passwordNueva")}
            autoComplete="new-password"
            state={errors.passwordNueva ? "error" : "default"}
            aria-invalid={Boolean(errors.passwordNueva)}
          />
          {errors.passwordNueva && <p className={errorClass}>{errors.passwordNueva.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="perfil-password-confirmar"
            label="Confirmar contraseña nueva"
            type={ver.confirmar ? "text" : "password"}
            rightIcon={<OjoPassword visible={ver.confirmar} onToggle={() => alternar("confirmar")} />}
            leftIcon={<KeyRound size={18} />}
            {...register("confirmar")}
            autoComplete="new-password"
            state={errors.confirmar ? "error" : "default"}
            aria-invalid={Boolean(errors.confirmar)}
          />
          {errors.confirmar && <p className={errorClass}>{errors.confirmar.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="md" disabled={isSubmitting} className="w-44">
          Cambiar contraseña
        </Button>
      </div>
    </form>
  )
}
