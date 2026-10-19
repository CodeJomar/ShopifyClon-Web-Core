"use client"

import { useForm } from "react-hook-form"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { type GrupoFormValues } from "../schema"
import { errorClass } from "./estilos"

/** Nombre y reglas de selección (cuántas opciones puede elegir el cliente). */
export function GrupoCampos({
  register,
  errors,
  idBase,
}: {
  register: ReturnType<typeof useForm<GrupoFormValues>>["register"]
  errors: ReturnType<typeof useForm<GrupoFormValues>>["formState"]["errors"]
  idBase: string
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <FloatingInput
          id={`${idBase}-nombre`}
          label="Nombre del grupo (Ej. Tipo de leche)"
          {...register("nombre")}
          maxLength={60}
          autoComplete="off"
          state={errors.nombre ? "error" : "default"}
        />
        {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id={`${idBase}-min`}
            label="Elegir mínimo"
            {...register("seleccionMinima")}
            inputMode="numeric"
            state={errors.seleccionMinima ? "error" : "default"}
          />
          {errors.seleccionMinima && <p className={errorClass}>{errors.seleccionMinima.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id={`${idBase}-max`}
            label="Elegir máximo"
            {...register("seleccionMaxima")}
            inputMode="numeric"
            state={errors.seleccionMaxima ? "error" : "default"}
          />
          {errors.seleccionMaxima && <p className={errorClass}>{errors.seleccionMaxima.message}</p>}
        </div>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-stone-400">
        Mínimo 0 = opcional; 1 o más = el cliente debe elegir al menos esa cantidad.
      </p>
    </>
  )
}
