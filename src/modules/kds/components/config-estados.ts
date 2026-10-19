import { ChefHat, CheckCircle2, Clock, Hourglass, LayoutGrid, type LucideIcon } from "lucide-react"
import type { EstadoItemKds } from "@/dtos/pedidos"
import type { EstadoColaKds, FiltroEstadoKds } from "../schema"

/* -------------------------------------------------------------------------- */
/*               Configuración visual por estado de comanda                   */
/* -------------------------------------------------------------------------- */

export const ESTADO_COMANDA_CONFIG: Record<
  EstadoColaKds,
  {
    label: string
    icon: LucideIcon
    badge: string
    border: string
    accent: string
  }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-900/40",
    accent: "text-amber-700 dark:text-amber-300",
  },
  en_preparacion: {
    label: "En preparación",
    icon: ChefHat,
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-900/40",
    accent: "text-sky-700 dark:text-sky-300",
  },
}

/* -------------------------------------------------------------------------- */
/*               Configuración visual por estado de producto                  */
/* -------------------------------------------------------------------------- */

export const ESTADO_ITEM_CONFIG: Record<EstadoItemKds, { label: string; icon: LucideIcon; chip: string }> = {
  cola: {
    label: "En cola",
    icon: Hourglass,
    chip: "bg-slate-100 text-slate-600 dark:bg-stone-800 dark:text-stone-300",
  },
  preparando: {
    label: "Preparando",
    icon: ChefHat,
    chip: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  despachado: {
    label: "Listo",
    icon: CheckCircle2,
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
}

/* -------------------------------------------------------------------------- */
/*               Configuración del filtro (tabs)                              */
/* -------------------------------------------------------------------------- */

export const FILTRO_CONFIG: Record<FiltroEstadoKds, { icon: LucideIcon; label: string }> = {
  todas: { icon: LayoutGrid, label: "Todas" },
  pendiente: { icon: Clock, label: "Pendientes" },
  en_preparacion: { icon: ChefHat, label: "Preparando" },
}
