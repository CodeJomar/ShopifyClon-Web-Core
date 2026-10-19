"use client"

import { getCategoriaConfig } from "@/shared/utils/categoria-visual"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { cn } from "@/shared/utils/cn"
import { categoriaFormSchema, type CategoriaFormValues, type CategoriaMenu } from "../schema"
import { botonIcono, errorClass } from "./estilos"

export function CategoriaFila({
  categoria,
  totalProductos,
  editando,
  puedeEditar,
  puedeEliminar,
  puedeSubir,
  puedeBajar,
  onMover,
  onEditar,
  onCancelarEdicion,
  onGuardar,
  onEliminar,
}: {
  categoria: CategoriaMenu
  totalProductos: number
  editando: boolean
  puedeEditar: boolean
  puedeEliminar: boolean
  puedeSubir: boolean
  puedeBajar: boolean
  onMover: (salto: -1 | 1) => void
  onEditar: () => void
  onCancelarEdicion: () => void
  onGuardar: (nombre: string) => Promise<void>
  onEliminar: () => Promise<void>
}) {
  const config = getCategoriaConfig(categoria)
  const Icono = config.icon
  const enUso = totalProductos > 0
  const inputId = React.useId()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: { nombre: categoria.nombre },
  })

  if (editando) {
    return (
      <li className="p-3">
        <form onSubmit={handleSubmit(({ nombre }) => onGuardar(nombre))} className="flex flex-col gap-1.5" noValidate>
          <div className="flex items-center gap-2">
            <FloatingInput
              id={inputId}
              label="Nombre de la categoría"
              {...register("nombre")}
              maxLength={50}
              autoComplete="off"
              autoFocus
              state={errors.nombre ? "error" : "default"}
              aria-invalid={Boolean(errors.nombre)}
            />
            <button type="submit" disabled={isSubmitting} aria-label="Guardar nombre" className={botonIcono}>
              <Check className="size-4" />
            </button>
            <button
              type="button"
              onClick={onCancelarEdicion}
              disabled={isSubmitting}
              aria-label="Cancelar edición"
              className={botonIcono}
            >
              <X className="size-4" />
            </button>
          </div>
          {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 p-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", config.className)}>
        <Icono className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-slate-900 dark:text-stone-100">{categoria.nombre}</span>
        <span className="text-xs text-slate-500 dark:text-stone-400">
          {totalProductos} {totalProductos === 1 ? "producto" : "productos"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {(puedeSubir || puedeBajar) && (
          <>
            <button type="button" onClick={() => onMover(-1)} disabled={!puedeSubir} aria-label={`Subir ${categoria.nombre}`} className={botonIcono}>
              <ArrowUp className="size-4" />
            </button>
            <button type="button" onClick={() => onMover(1)} disabled={!puedeBajar} aria-label={`Bajar ${categoria.nombre}`} className={botonIcono}>
              <ArrowDown className="size-4" />
            </button>
          </>
        )}
        {puedeEditar && (
          <button type="button" onClick={onEditar} aria-label={`Renombrar ${categoria.nombre}`} className={botonIcono}>
            <Pencil className="size-4" />
          </button>
        )}
        {puedeEliminar && (
          <button
            type="button"
            onClick={() => void onEliminar()}
            disabled={enUso}
            title={enUso ? "Tiene productos asociados" : undefined}
            aria-label={`Eliminar ${categoria.nombre}`}
            className={cn(botonIcono, "hover:text-red-600 dark:hover:text-red-400")}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </li>
  )
}
