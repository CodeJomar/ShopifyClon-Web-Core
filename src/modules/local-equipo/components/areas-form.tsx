"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Pencil, X } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"
import { getAreaConfig } from "@/shared/utils/mesa-visual"

import { areaFormSchema, type AreaFormValues } from "../schema"
import { botonIcono, errorClass } from "./estilos"

/** Panel para renombrar las áreas del local; el cambio se aplica a todas las mesas del área. */
export function AreasForm({
  areas,
  mesasPorArea,
  onRenombrar,
  onClose,
}: {
  // Áreas existentes (sin «Sin área», que no se puede renombrar)
  areas: string[]
  mesasPorArea: ReadonlyMap<string, number>
  // Devuelve true si se renombró
  onRenombrar: (actual: string, nuevo: string) => Promise<boolean>
  onClose: () => void
}) {
  const [editando, setEditando] = React.useState<string | null>(null)

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
      title="Áreas del local"
      description="Renombra un área y todas sus mesas pasan a la nueva."
      footer={
        <Button type="button" variant="neutral" size="md" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {areas.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 p-4 text-center text-sm text-slate-500 dark:border-stone-800 dark:text-stone-400">
          Aún no hay áreas. Se crean al asignarlas a una mesa.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 dark:divide-stone-800 dark:border-stone-800">
          {areas.map((area) =>
            editando === area ? (
              <AreaFilaEdicion
                key={area}
                area={area}
                onCancelar={() => setEditando(null)}
                onGuardar={async (nuevo) => {
                  if (nuevo === area || (await onRenombrar(area, nuevo))) setEditando(null)
                }}
              />
            ) : (
              <AreaFila key={area} area={area} total={mesasPorArea.get(area) ?? 0} onEditar={() => setEditando(area)} />
            )
          )}
        </ul>
      )}
    </FormPanel>
  )
}

function AreaFila({ area, total, onEditar }: { area: string; total: number; onEditar: () => void }) {
  const config = getAreaConfig(area)
  return (
    <li className="flex items-center gap-3 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-200">
        <config.icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-slate-900 dark:text-stone-100">{area}</span>
        <span className="text-xs text-slate-500 dark:text-stone-400">
          {total} {total === 1 ? "mesa" : "mesas"}
        </span>
      </div>
      <button type="button" onClick={onEditar} aria-label={`Renombrar ${area}`} className={botonIcono}>
        <Pencil className="size-4" />
      </button>
    </li>
  )
}

function AreaFilaEdicion({
  area,
  onCancelar,
  onGuardar,
}: {
  area: string
  onCancelar: () => void
  onGuardar: (nuevo: string) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AreaFormValues>({ resolver: zodResolver(areaFormSchema), defaultValues: { nombre: area } })

  return (
    <li className="p-3">
      <form onSubmit={handleSubmit(({ nombre }) => onGuardar(nombre))} className="flex flex-col gap-1.5" noValidate>
        <div className="flex items-center gap-2">
          <FloatingInput
            label="Nombre del área"
            {...register("nombre")}
            maxLength={30}
            autoComplete="off"
            autoFocus
            state={errors.nombre ? "error" : "default"}
            aria-invalid={Boolean(errors.nombre)}
          />
          <button type="submit" disabled={isSubmitting} aria-label="Guardar nombre" className={botonIcono}>
            <Check className="size-4" />
          </button>
          <button type="button" onClick={onCancelar} disabled={isSubmitting} aria-label="Cancelar edición" className={botonIcono}>
            <X className="size-4" />
          </button>
        </div>
        {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
      </form>
    </li>
  )
}
