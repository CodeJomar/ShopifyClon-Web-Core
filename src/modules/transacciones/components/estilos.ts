
/* -------------------------------------------------------------------------- */
/*                Superficies y textos legibles en claro / oscuro             */
/* -------------------------------------------------------------------------- */

// Superficie base de los paneles (alineada con POS y Dashboard)
export const panelClass =
  "rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-stone-800 dark:bg-stone-950/40 transition-colors"

// Tarjeta interna sobre un panel
export const tarjetaClass =
  "rounded-2xl border border-slate-200/80 bg-white dark:border-stone-800 dark:bg-stone-900 transition-colors"

// Tipografías con contraste garantizado en ambos temas
export const textoTitulo = "text-slate-900 dark:text-stone-100"

export const textoCuerpo = "text-slate-700 dark:text-stone-200"

export const textoSecundario = "text-slate-500 dark:text-stone-400"

export const textoEtiqueta = "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400"

export const textoAcento = "text-[#4C0107] dark:text-[#E7B7BC]"

export const mensajeErrorClass =
  "rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"

export const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors cursor-pointer focus:border-slate-600 focus:ring-2 focus:ring-slate-400/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-300 dark:focus:ring-white/10 dark:[color-scheme:dark]"

// Botón secundario con contraste en modo oscuro (el variant outline base usa el vino corporativo)
export const botonSecundarioClass =
  "dark:border-stone-600 dark:bg-transparent dark:text-stone-100 dark:hover:bg-stone-800 dark:hover:text-white"

// Botón destructivo legible en ambos temas
export const botonPeligroClass =
  "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-white dark:hover:bg-red-600"

// Clases para opciones seleccionables (chips, métodos de pago, filtros)
export const opcionClass = (activa: boolean) =>
  activa
    ? "border-[#4C0107] bg-[#4C0107] text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
    : "border-slate-200 bg-white text-slate-700 hover:border-[#4C0107]/40 hover:text-[#4C0107] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:text-stone-100"

// Pestañas tipo píldora del encabezado
export const pestanaClass = (activa: boolean) =>
  activa
    ? "bg-[#4C0107] text-white shadow-sm dark:bg-stone-100 dark:text-stone-900"
    : "text-slate-600 hover:text-slate-900 dark:text-stone-300 dark:hover:text-white"
