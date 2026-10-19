"use client"

import { useSession } from "@/modules/auth"

import { AccesosCard } from "../components/accesos-card"
import { DatosPerfilForm } from "../components/datos-perfil-form"
import { PasswordForm } from "../components/password-form"
import { PerfilCabecera } from "../components/perfil-cabecera"
import { usePerfil } from "../hooks/use-perfil"

/** Mi perfil: quién soy, mis datos, mi contraseña y a qué puedo entrar (cerrar sesión está en el encabezado). */
export function PerfilView() {
  const usuario = useSession()
  const { guardarDatos, cambiarContrasena } = usePerfil()

  return (
    <div className="flex w-full flex-col gap-5 pb-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-stone-100">Mi perfil</h1>
        <p className="text-xs text-slate-500 sm:text-sm dark:text-stone-400">Tus datos, tu contraseña y los accesos de tu cargo.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-5">
          <PerfilCabecera usuario={usuario} />
          <AccesosCard />
        </div>
        <div className="flex flex-col gap-5">
          <DatosPerfilForm key={usuario.nombre} usuario={usuario} onGuardar={guardarDatos} />
          <PasswordForm onCambiar={cambiarContrasena} />
        </div>
      </div>
    </div>
  )
}
