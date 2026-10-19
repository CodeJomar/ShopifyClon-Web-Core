"use client"

import { Checkbox } from "@/shared/components/ui/checkbox"
import { cn } from "@/shared/utils/cn"

import { clavePermiso, type ModuloCatalogo } from "../schema"
import { tarjetaClass } from "./estilos"
import { getModuloConfig } from "./visual-modulos"

/** Tarjeta de un módulo con la lista de acciones que se pueden conceder al cargo. */
export function TarjetaModulo({
  modulo,
  seleccionados,
  soloLectura,
  onChange,
}: {
  modulo: ModuloCatalogo
  seleccionados: string[]
  soloLectura: boolean
  onChange: (permisos: string[]) => void
}) {
  const config = getModuloConfig(modulo.modulo)
  const activos = modulo.acciones.filter((a) => seleccionados.includes(clavePermiso(modulo.modulo, a.accion))).length

  const alternar = (clave: string, marcado: boolean) =>
    onChange(marcado ? [...seleccionados, clave] : seleccionados.filter((p) => p !== clave))

  return (
    <article className={cn(tarjetaClass, "gap-3")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900 dark:text-stone-100">
          <config.icon className="size-4 shrink-0 text-[#4C0107] dark:text-[#E7B7BC]" />
          <span className="truncate">{modulo.etiqueta}</span>
        </h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            activos > 0
              ? "bg-[#EDE5E6] text-[#4C0107] dark:bg-[#E7B7BC]/15 dark:text-[#E7B7BC]"
              : "bg-slate-100 text-slate-500 dark:bg-stone-800 dark:text-stone-400"
          )}
        >
          {activos}/{modulo.acciones.length}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {modulo.acciones.map((accion) => {
          const clave = clavePermiso(modulo.modulo, accion.accion)
          const marcado = seleccionados.includes(clave)
          return (
            <li key={accion.accion}>
              <label
                className={cn(
                  "flex items-center gap-2.5 text-sm text-slate-700 dark:text-stone-300",
                  soloLectura ? "cursor-default" : "cursor-pointer"
                )}
              >
                <Checkbox
                  checked={marcado}
                  disabled={soloLectura}
                  onCheckedChange={(valor) => alternar(clave, valor === true)}
                  className="border-slate-300 data-checked:border-[#4C0107] data-checked:bg-[#4C0107] data-checked:text-white dark:border-stone-600 dark:data-checked:border-[#E7B7BC] dark:data-checked:bg-[#E7B7BC] dark:data-checked:text-stone-900"
                />
                <span className="truncate" title={accion.etiqueta}>
                  {accion.etiqueta}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
