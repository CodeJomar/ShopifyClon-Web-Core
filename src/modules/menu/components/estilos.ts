"use client"

import type { FiltroDisponibilidad } from "../schema"

// Superficie base de los paneles del menú (claro / oscuro), alineada con POS y dashboard
export const panelClass =
  "rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-stone-800 dark:bg-stone-950/40 transition-colors"

// Clases para opciones seleccionables (chips de categoría y filtros)
export const opcionClass = (activa: boolean) =>
  activa
    ? "border-[#4C0107] bg-[#4C0107] text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
    : "border-slate-200 bg-white text-slate-700 hover:border-[#4C0107]/40 hover:text-[#4C0107] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-500"

// Etiqueta de estado del producto, legible en modo claro y oscuro
export const ESTADO_PRODUCTO_CLASS = {
  disponible: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  agotado: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
} as const

// Acento de cada filtro de disponibilidad en los contadores del resumen
export const RESUMEN_CONFIG: Record<FiltroDisponibilidad, { label: string; valueClass: string }> = {
  todos: { label: "Productos", valueClass: "text-slate-900 dark:text-stone-100" },
  disponibles: { label: "Disponibles", valueClass: "text-emerald-700 dark:text-emerald-400" },
  agotados: { label: "Agotados", valueClass: "text-red-600 dark:text-red-400" },
}

export const labelClass = "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400"

export const errorClass = "text-xs font-medium text-red-600 dark:text-red-400"

export const botonIcono =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
