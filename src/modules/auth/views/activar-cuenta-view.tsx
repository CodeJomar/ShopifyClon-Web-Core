"use client"

import Link from "next/link"
import { Coffee, ArrowLeft, MailWarning } from "lucide-react"

import { Spinner } from "@/shared/components/ui/spinner"
import { NewPasswordForm } from "@/modules/auth/components/new-password-form"
import { useActivarCuenta } from "@/modules/auth/hooks/use-activar-cuenta"

interface ActivarCuentaViewProps {
  /** Token del enlace de activación recibido por correo (?token=). */
  token?: string
}

export function ActivarCuentaView({ token }: ActivarCuentaViewProps) {
  const { estado, nombre, mensajeInvalido, activar } = useActivarCuenta(token)

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
          {estado === "invalido" ? "Enlace no disponible" : "Activar Cuenta"}
        </p>
      </div>

      {estado === "validando" && (
        <div className="flex flex-col items-center gap-3 py-6 text-xs text-slate-500" role="status">
          <Spinner />
          <span>Verificando tu enlace...</span>
        </div>
      )}

      {estado === "valido" && (
        <NewPasswordForm
          description={`Hola ${nombre}, define la contraseña con la que ingresarás a Coffy Flow.`}
          submitLabel="Activar Cuenta"
          onSubmit={activar}
        />
      )}

      {estado === "invalido" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <MailWarning size={24} />
          </div>
          <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed">{mensajeInvalido}</p>
          <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed">
            Pide al administrador que te reenvíe el correo de activación.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#4C0107] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Ir a Iniciar Sesión
          </Link>
        </div>
      )}
    </div>
  )
}
