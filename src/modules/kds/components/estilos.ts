
// Superficie base de los paneles del KDS, alineada con el POS y dashboard
export const panelClass =
  "rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-stone-800 dark:bg-stone-950/40 transition-colors"

/* -------------------------------------------------------------------------- */
/*             Utilidad de urgencia según minutos transcurridos                */
/* -------------------------------------------------------------------------- */

/** Devuelve una clase CSS de acento según la urgencia del tiempo */
export function urgenciaClass(minutos: number): string {
  if (minutos >= 20) return "text-red-600 dark:text-red-400"
  if (minutos >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-slate-500 dark:text-stone-400"
}
