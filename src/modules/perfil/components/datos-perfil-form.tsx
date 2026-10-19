"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, User } from "lucide-react"

import type { SesionUsuarioDto } from "@/dtos/auth"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"

import { datosPerfilSchema, type DatosPerfilValues } from "../schema"
import { descripcionTarjeta, errorClass, tarjetaPerfil, tituloTarjeta } from "./estilos"

/** Datos personales: el nombre se puede cambiar; el correo y el cargo los administra quien gestiona usuarios. */
export function DatosPerfilForm({
  usuario,
  onGuardar,
}: {
  usuario: SesionUsuarioDto
  // Devuelve true si se guardó
  onGuardar: (values: DatosPerfilValues) => Promise<boolean>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DatosPerfilValues>({ resolver: zodResolver(datosPerfilSchema), defaultValues: { nombre: usuario.nombre } })

  return (
    <form onSubmit={handleSubmit(async (values) => void (await onGuardar(values)))} noValidate className={tarjetaPerfil}>
      <div className="flex flex-col gap-0.5">
        <h3 className={tituloTarjeta}>Datos personales</h3>
        <p className={descripcionTarjeta}>Así te ven tus compañeros en el sistema.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FloatingInput
          id="perfil-nombre"
          label="Nombre completo"
          leftIcon={<User size={18} />}
          {...register("nombre")}
          maxLength={100}
          autoComplete="name"
          state={errors.nombre ? "error" : "default"}
          aria-invalid={Boolean(errors.nombre)}
        />
        {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <FloatingInput id="perfil-email" label="Correo electrónico" leftIcon={<Mail size={18} />} value={usuario.email} readOnly disabled />
        <p className={descripcionTarjeta}>Para cambiar tu correo o tu cargo, pídeselo a quien administra el equipo.</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="md" disabled={isSubmitting || !isDirty} className="w-44">
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
