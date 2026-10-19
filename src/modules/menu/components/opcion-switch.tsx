"use client"

import * as React from "react"
import { Controller, type Control } from "react-hook-form"
import { Switch } from "@/shared/components/ui/switch"
import { type ProductoFormValues } from "../schema"

export function OpcionSwitch({
  control,
  titulo,
  descripcion,
}: {
  control: Control<ProductoFormValues>
  titulo: string
  descripcion: string
}) {
  const id = React.useId()

  return (
    <Controller
      control={control}
      name="disponible"
      render={({ field }) => (
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-0.5">
            <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-stone-100">
              {titulo}
            </label>
            <span className="text-xs text-slate-500 dark:text-stone-400">{descripcion}</span>
          </div>
          <Switch
            id={id}
            checked={field.value}
            onCheckedChange={(checked) => field.onChange(checked)}
            className="dark:data-checked:bg-emerald-500"
          />
        </div>
      )}
    />
  )
}
