"use client"

import { cn } from "@/shared/utils/cn"
import { getCategoriaConfig } from "@/shared/utils/categoria-visual"

/** Valor del filtro «todas las categorías»; es el mismo en el POS y en el menú. */
const TODOS = "todos"

/**
 * Categorías del catálogo como fichas con ícono (estilo carta de cafetería): una sola fila que se desplaza a los lados,
 * con la categoría activa resaltada en el color del negocio y la cantidad de productos de cada una. Lo usan el POS y el
 * menú, para que el filtro se vea y se comporte igual en ambos.
 */
export function CategoriaChips({
  categorias,
  productos,
  activa,
  onChange,
  idPrefijo = "categoria",
}: {
  categorias: { id: string; nombre: string }[]
  productos: { id_categoria: string }[]
  activa: string
  onChange: (categoria: string) => void
  /** Prefijo de los `id` de los botones (`<prefijo>-<categoría>`). */
  idPrefijo?: string
}) {
  const opciones: { id: string; nombre: string; total: number; config: ReturnType<typeof getCategoriaConfig> }[] = [
    { id: TODOS, nombre: "Todos", total: productos.length, config: getCategoriaConfig(TODOS) },
    ...categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      total: productos.filter((p) => p.id_categoria === c.id).length,
      config: getCategoriaConfig(c),
    })),
  ]

  return (
    <div className="-mx-1 flex shrink-0 items-stretch gap-2 overflow-x-auto px-1 pb-1 no-scrollbar" role="toolbar" aria-label="Filtrar por categoría">
      {opciones.map((opcion) => {
        const Icono = opcion.config.icon
        const esActiva = activa === opcion.id
        return (
          <button
            key={opcion.id}
            id={`${idPrefijo}-${opcion.id}`}
            type="button"
            aria-pressed={esActiva}
            onClick={() => onChange(opcion.id)}
            className={cn(
              "flex w-[84px] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-center transition-all",
              esActiva
                ? "border-[#4C0107] bg-[#4C0107] text-white shadow-md dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                : "border-slate-100 bg-white text-slate-700 hover:border-[#4C0107]/30 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-600",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                esActiva ? "bg-white/15 text-white dark:bg-stone-900/10 dark:text-stone-900" : opcion.config.className,
              )}
            >
              <Icono className="size-[18px]" />
            </span>
            <span className="w-full truncate text-[11px] font-semibold leading-tight">{opcion.nombre}</span>
            <span className={cn("text-[10px] tabular-nums", esActiva ? "text-white/70 dark:text-stone-600" : "text-slate-400 dark:text-stone-500")}>
              {opcion.total}
            </span>
          </button>
        )
      })}
    </div>
  )
}
