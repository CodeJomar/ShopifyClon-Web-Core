"use client"

import * as React from "react"
import { Crown, MailCheck, Pencil, Phone, UserCheck, UserMinus, UserX } from "lucide-react"

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/cn"
import { formatDateStrict } from "@/shared/utils/formatters"

import type { Empleado } from "../schema"
import { ESTADO_EMPLEADO_CONFIG } from "./estado-empleado"
import { botonIcono, tarjetaClass } from "./estilos"
import { iniciales } from "./iniciales"
import { getRolVisual } from "./visual-roles"

export function EmpleadoCard({
  empleado,
  puedeEditar,
  puedeDarDeBaja,
  onEditar,
  onDarDeBaja,
  onCambiarEstado,
  onReenviar,
}: {
  empleado: Empleado
  puedeEditar: boolean
  puedeDarDeBaja: boolean
  onEditar: (empleado: Empleado) => void
  onDarDeBaja: (empleado: Empleado) => void
  onCambiarEstado: (empleado: Empleado, estado: "activo" | "suspendido") => Promise<boolean>
  onReenviar: (empleado: Empleado) => Promise<boolean>
}) {
  const [ocupado, setOcupado] = React.useState(false)
  const estado = ESTADO_EMPLEADO_CONFIG[empleado.estado]
  const visual = getRolVisual(empleado.rol_nombre ?? "")
  const IconoRol = visual.icon
  const esDueno = empleado.tipo_cuenta === "OWNER"
  const deBaja = empleado.estado === "inactivo"
  const puedeReactivar = empleado.estado === "inactivo" || empleado.estado === "suspendido"
  const puedeSuspender = empleado.estado === "activo"
  const pendiente = empleado.estado === "pendiente_activacion"

  const ejecutar = async (accion: () => Promise<unknown>) => {
    setOcupado(true)
    await accion()
    setOcupado(false)
  }

  return (
    <article className={cn(tarjetaClass, "gap-3", deBaja && "opacity-70")}>
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          <AvatarFallback className={cn("text-sm", visual.className)}>{iniciales(empleado.nombre)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-stone-100">{empleado.nombre}</h3>
            {esDueno && <Crown className="size-3.5 shrink-0 text-amber-500" aria-label="Dueño" />}
          </div>
          <p className="truncate text-xs text-slate-500 dark:text-stone-400">{empleado.email}</p>
        </div>
        <Badge variant="estado" className={cn("shrink-0 px-2 text-[11px]", estado.className)}>
          {estado.label}
        </Badge>
      </div>

      <div className="flex min-w-0 items-center gap-1.5">
        <Badge variant="estado" className={cn("max-w-full gap-1 px-2 text-[11px]", visual.className)}>
          <IconoRol className="size-3 shrink-0" />
          <span className="truncate">{empleado.rol_nombre ?? (esDueno ? "Propietario" : "Sin cargo asignado")}</span>
        </Badge>
        {esDueno && (
          <Badge variant="estado" className="bg-amber-50 px-2 text-[11px] text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            Dueño
          </Badge>
        )}
        {/* Ficha: el teléfono, con el DNI al pasar el cursor */}
        {empleado.telefono && (
          <span
            className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] text-slate-500 dark:text-stone-400"
            title={empleado.dni ? `DNI ${empleado.dni}` : undefined}
          >
            <Phone className="size-3" />
            {empleado.telefono}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-stone-800">
        <span className="truncate text-[11px] text-slate-400 dark:text-stone-500">
          {empleado.fecha_ingreso
            ? `Ingreso: ${formatDateStrict(`${empleado.fecha_ingreso}T12:00:00`)}`
            : `Registrado el ${formatDateStrict(empleado.fecha_creacion)}`}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          {puedeEditar && !esDueno && pendiente && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => void ejecutar(() => onReenviar(empleado))}
              aria-label={`Reenviar activación a ${empleado.nombre}`}
              title="Reenviar correo de activación"
              className={cn(botonIcono, "hover:text-sky-700 dark:hover:text-sky-300")}
            >
              <MailCheck className={cn("size-4", ocupado && "animate-pulse")} />
            </button>
          )}
          {puedeEditar && !esDueno && (
            <button type="button" onClick={() => onEditar(empleado)} aria-label={`Editar ${empleado.nombre}`} className={botonIcono}>
              <Pencil className="size-4" />
            </button>
          )}
          {puedeEditar && !esDueno && puedeSuspender && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => void ejecutar(() => onCambiarEstado(empleado, "suspendido"))}
              aria-label={`Suspender a ${empleado.nombre}`}
              title="Suspender"
              className={cn(botonIcono, "hover:text-amber-700 dark:hover:text-amber-400")}
            >
              <UserX className={cn("size-4", ocupado && "animate-pulse")} />
            </button>
          )}
          {puedeEditar && !esDueno && puedeReactivar && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => void ejecutar(() => onCambiarEstado(empleado, "activo"))}
              aria-label={`Reactivar a ${empleado.nombre}`}
              title="Reactivar"
              className={cn(botonIcono, "hover:text-emerald-700 dark:hover:text-emerald-400")}
            >
              <UserCheck className={cn("size-4", ocupado && "animate-pulse")} />
            </button>
          )}
          {puedeDarDeBaja && !esDueno && !deBaja && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onDarDeBaja(empleado)}
              aria-label={`Dar de baja a ${empleado.nombre}`}
              title="Dar de baja"
              className={cn(botonIcono, "hover:text-red-600 dark:hover:text-red-400")}
            >
              <UserMinus className="size-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
