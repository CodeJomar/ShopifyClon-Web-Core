"use client"

import { Crown, Mail } from "lucide-react"

import type { SesionUsuarioDto } from "@/dtos/auth"
import { etiquetaCuenta, etiquetaRol, iniciales } from "@/modules/auth"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"

import { tarjetaPerfil } from "./estilos"

/** Quién eres: avatar con iniciales, nombre, cargo, tipo de cuenta y correo. */
export function PerfilCabecera({ usuario }: { usuario: SesionUsuarioDto }) {
  const esDueno = usuario.tipo_cuenta === "OWNER"

  return (
    <section className={tarjetaPerfil} aria-label="Resumen de tu cuenta">
      <div className="flex items-center gap-4">
        <Avatar className="size-20 shrink-0">
          <AvatarFallback className="text-2xl">{iniciales(usuario.nombre)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-stone-100">{usuario.nombre}</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="estado" className="gap-1 bg-[#EDE5E6] px-2 text-[11px] text-[#4C0107] dark:bg-[#E7B7BC]/15 dark:text-[#E7B7BC]">
              {esDueno && <Crown className="size-3" />}
              {etiquetaRol(usuario)}
            </Badge>
            <Badge variant="estado" className="bg-slate-100 px-2 text-[11px] text-slate-600 dark:bg-stone-800 dark:text-stone-300">
              {etiquetaCuenta(usuario)}
            </Badge>
          </div>
        </div>
      </div>
      <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-stone-300">
        <Mail className="size-4 shrink-0 text-slate-400 dark:text-stone-500" />
        <span className="truncate">{usuario.email}</span>
      </p>
    </section>
  )
}
