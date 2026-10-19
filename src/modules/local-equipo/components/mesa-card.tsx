"use client"

import { Pencil, Trash2, Users } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/cn"

import { areaDeMesa, type Mesa } from "../schema"
import { ESTADO_MESA_CONFIG, getAreaConfig } from "@/shared/utils/mesa-visual"
import { botonIcono, tarjetaClass } from "./estilos"

export function MesaCard({
  mesa,
  puedeEditar,
  puedeEliminar,
  onEditar,
  onEliminar,
}: {
  mesa: Mesa
  puedeEditar: boolean
  puedeEliminar: boolean
  onEditar: (mesa: Mesa) => void
  onEliminar: (mesa: Mesa) => void
}) {
  const estado = ESTADO_MESA_CONFIG[mesa.estado]
  const area = areaDeMesa(mesa)
  const areaConfig = getAreaConfig(area)
  const enUso = mesa.estado !== "libre"

  return (
    <article className={cn(tarjetaClass, "gap-2 p-3.5")}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-bold text-slate-900 dark:text-stone-100">{mesa.numero}</h3>
        <Badge variant="estado" className={cn("shrink-0 px-2 text-[11px]", estado.badge)}>
          {estado.label}
        </Badge>
      </div>

      <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-stone-400">
        <areaConfig.icon className="size-3.5 shrink-0" />
        <span className="truncate">{area}</span>
        <span>·</span>
        <Users className="size-3.5 shrink-0" />
        <span className="shrink-0">{mesa.capacidad}</span>
      </p>

      <div className="mt-auto flex min-h-8 items-center justify-end gap-1 border-t border-slate-100 pt-2 dark:border-stone-800">
        {!puedeEditar && !puedeEliminar && (
          <span className="mr-auto text-[11px] text-slate-400 dark:text-stone-500">Solo lectura</span>
        )}
        {puedeEditar && (
          <button
            type="button"
            onClick={() => onEditar(mesa)}
            aria-label={`Editar ${mesa.numero}`}
            className={cn(botonIcono, "size-8")}
          >
            <Pencil className="size-4" />
          </button>
        )}
        {puedeEliminar && (
          <button
            type="button"
            onClick={() => onEliminar(mesa)}
            disabled={enUso}
            title={enUso ? "Tiene un pedido en curso" : undefined}
            aria-label={`Eliminar ${mesa.numero}`}
            className={cn(botonIcono, "size-8 hover:text-red-600 dark:hover:text-red-400")}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </article>
  )
}
