"use client"

import { Lock, Pencil } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"

import type { Rol } from "../schema"
import { tarjetaClass } from "./estilos"
import { getModuloConfig } from "./visual-modulos"
import { getRolVisual } from "./visual-roles"

export function RolCard({
  rol,
  editable,
  abriendo,
  onAbrir,
}: {
  rol: Rol
  editable: boolean
  abriendo: boolean
  onAbrir: () => void
}) {
  const visual = getRolVisual(rol.nombre)
  const Icono = visual.icon
  const empleados = rol.total_usuarios
  const subtitulo =
    empleados > 0 ? `${empleados} ${empleados === 1 ? "empleado asignado" : "empleados asignados"}` : "Sin empleados asignados"

  return (
    <article className={cn(tarjetaClass, "gap-3")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", visual.className)}>
            <Icono className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-stone-100">{rol.nombre}</h3>
            <p
              className={cn(
                "flex items-center gap-1.5 truncate text-xs font-medium",
                empleados > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-stone-400"
              )}
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", empleados > 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-stone-600")}
              />
              {subtitulo}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAbrir}
          disabled={abriendo}
          leftIcon={editable ? <Pencil className="size-3.5" /> : <Lock className="size-3.5" />}
          aria-label={editable ? `Editar permisos de ${rol.nombre}` : `Ver permisos de ${rol.nombre}`}
          className="h-8 shrink-0 gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-stone-700 dark:bg-transparent dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <span className="hidden sm:inline">{editable ? "Editar Permisos" : "Ver Permisos"}</span>
        </Button>
      </div>

      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600 dark:text-stone-300" title={rol.descripcion ?? undefined}>
        {rol.descripcion || "Sin descripción."}
      </p>

      <div className="h-px shrink-0 bg-slate-100 dark:bg-stone-800" />

      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="shrink-0 text-xs font-medium text-slate-500 tabular-nums dark:text-stone-400">
          {rol.total_permisos} {rol.total_permisos === 1 ? "permiso" : "permisos"}
        </p>
        {/* Módulos a los que el cargo tiene acceso */}
        <ul className="flex min-w-0 items-center justify-end gap-1" aria-label="Módulos con acceso">
          {rol.modulos.slice(0, 6).map((modulo) => {
            const config = getModuloConfig(modulo)
            return (
              <li
                key={modulo}
                title={modulo}
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#EDE5E6] text-[#4C0107] dark:bg-[#E7B7BC]/15 dark:text-[#E7B7BC]"
              >
                <config.icon className="size-3.5" />
              </li>
            )
          })}
          {rol.modulos.length > 6 && (
            <li className="text-[11px] font-semibold text-slate-500 dark:text-stone-400">+{rol.modulos.length - 6}</li>
          )}
        </ul>
      </div>
    </article>
  )
}
