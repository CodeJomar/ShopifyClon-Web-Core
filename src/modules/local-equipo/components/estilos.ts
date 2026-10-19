// Estilos compartidos de las vistas de Local y Equipo

// Misma identidad visual que el POS para el estado de las mesas y el ícono de cada área
export { ESTADO_MESA_CONFIG, getAreaConfig } from "@/shared/utils/mesa-visual"

// Superficie base de los paneles (claro / oscuro), alineada con POS y dashboard
export const panelClass =
  "rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-stone-800 dark:bg-stone-950/40 transition-colors"

// Clases para opciones seleccionables (chips de cargo y de área)
export const opcionClass = (activa: boolean) =>
  activa
    ? "border-[#4C0107] bg-[#4C0107] text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
    : "border-slate-200 bg-white text-slate-700 hover:border-[#4C0107]/40 hover:text-[#4C0107] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-500"

// Superficie de tarjeta usada en todas las vistas de Local y Equipo
export const tarjetaClass =
  "flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors dark:border-stone-800 dark:bg-stone-900"

export const botonPrimario =
  "h-10 rounded-full bg-[#4C0107] px-4 text-white hover:bg-[#4C0107]/90 sm:px-5 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"

export const botonSecundario =
  "h-10 rounded-full px-4 sm:px-5 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"

export const botonIcono =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"

// Select nativo de shared con la apariencia de los filtros de la app
export const selectClass =
  "[&_select]:h-10 [&_select]:rounded-xl [&_select]:border-slate-300 [&_select]:bg-slate-50 [&_select]:pl-3 [&_select]:text-sm [&_select]:text-slate-900 dark:[&_select]:border-stone-700 dark:[&_select]:bg-stone-950 dark:[&_select]:text-stone-100 dark:[&_select]:[color-scheme:dark]"

export const errorClass = "text-xs font-medium text-red-600 dark:text-red-400"
