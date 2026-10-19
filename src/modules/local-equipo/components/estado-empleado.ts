import type { EstadoEmpleado } from "../schema"

/** Etiqueta y colores de cada estado de la cuenta del empleado. */
export const ESTADO_EMPLEADO_CONFIG: Record<EstadoEmpleado, { label: string; className: string }> = {
  activo: {
    label: "Activo",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  pendiente_activacion: {
    label: "Pendiente",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  },
  suspendido: {
    label: "Suspendido",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  bloqueado: {
    label: "Bloqueado",
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  inactivo: {
    label: "De baja",
    className: "bg-slate-100 text-slate-600 dark:bg-stone-800 dark:text-stone-300",
  },
}
