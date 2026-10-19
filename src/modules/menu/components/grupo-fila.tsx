"use client"

import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import { cn } from "@/shared/utils/cn"

import { etiquetaDelta, type GrupoMenu, type OpcionMenu } from "../schema"
import { botonIcono } from "./estilos"

/** Un grupo de personalización: resumen y, al abrirlo, sus opciones. Crear y editar se hacen en paneles aparte. */
export function GrupoFila({
  grupo,
  abierto,
  puedeCrear,
  puedeEditar,
  puedeEliminar,
  onAlternar,
  onEditarGrupo,
  onEliminarGrupo,
  onNuevaOpcion,
  onEditarOpcion,
  onAlternarOpcion,
  onEliminarOpcion,
}: {
  grupo: GrupoMenu
  abierto: boolean
  puedeCrear: boolean
  puedeEditar: boolean
  puedeEliminar: boolean
  onAlternar: () => void
  onEditarGrupo: () => void
  onEliminarGrupo: () => void
  onNuevaOpcion: () => void
  onEditarOpcion: (opcion: OpcionMenu) => void
  onAlternarOpcion: (idOpcion: string, nombre: string, disponible: boolean) => void
  onEliminarOpcion: (idOpcion: string, nombre: string) => void
}) {
  return (
    <li className="flex flex-col">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={abierto}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <ChevronDown className={cn("size-4 shrink-0 text-slate-400 transition-transform", abierto && "rotate-180")} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-stone-100">{grupo.nombre}</span>
            <span className="text-xs text-slate-500 dark:text-stone-400">
              {grupo.obligatorio ? "Obligatorio" : "Opcional"} · elegir {grupo.seleccion_minima}–{grupo.seleccion_maxima} ·{" "}
              {grupo.opciones.length} {grupo.opciones.length === 1 ? "opción" : "opciones"}
            </span>
          </span>
        </button>
        {puedeEditar && (
          <button type="button" onClick={onEditarGrupo} aria-label={`Editar ${grupo.nombre}`} className={botonIcono}>
            <Pencil className="size-4" />
          </button>
        )}
        {puedeEliminar && (
          <button
            type="button"
            onClick={onEliminarGrupo}
            aria-label={`Eliminar ${grupo.nombre}`}
            className={cn(botonIcono, "hover:text-red-600 dark:hover:text-red-400")}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {abierto && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/40">
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-stone-800">
            {grupo.opciones.length === 0 && (
              <li className="py-2 text-xs text-slate-500 dark:text-stone-400">Este grupo aún no tiene opciones.</li>
            )}
            {grupo.opciones.map((opcion) => (
              <li key={opcion.id_opcion} className="flex items-center gap-2 py-2">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "truncate text-sm text-slate-900 dark:text-stone-100",
                      !opcion.disponible && "text-slate-400 line-through dark:text-stone-500"
                    )}
                  >
                    {opcion.nombre}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-500 dark:text-stone-400">
                    {etiquetaDelta(opcion.price_delta)}
                    {!opcion.disponible && " · agotada"}
                  </span>
                </span>
                {puedeEditar && (
                  <>
                    <Switch
                      checked={opcion.disponible}
                      onCheckedChange={(checked) => onAlternarOpcion(opcion.id_opcion, opcion.nombre, checked)}
                      aria-label={`Disponibilidad de ${opcion.nombre}`}
                      className="dark:data-checked:bg-emerald-500"
                    />
                    <button type="button" onClick={() => onEditarOpcion(opcion)} aria-label={`Editar ${opcion.nombre}`} className={botonIcono}>
                      <Pencil className="size-4" />
                    </button>
                  </>
                )}
                {puedeEliminar && (
                  <button
                    type="button"
                    onClick={() => onEliminarOpcion(opcion.id_opcion, opcion.nombre)}
                    aria-label={`Eliminar ${opcion.nombre}`}
                    className={cn(botonIcono, "hover:text-red-600 dark:hover:text-red-400")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {puedeCrear && (
            <Button type="button" variant="neutral" size="sm" onClick={onNuevaOpcion} leftIcon={<Plus className="size-4" />} className="self-start">
              Agregar opción
            </Button>
          )}
        </div>
      )}
    </li>
  )
}
