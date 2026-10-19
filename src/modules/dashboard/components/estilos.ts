import type { EstadoPedido } from "@/dtos/pedidos"

// Superficie base de los paneles del dashboard (claro / oscuro)
export const panelClass =
  "rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-stone-800 dark:bg-stone-950/40 transition-colors"

// Estilos de los estados de pedido con variantes para modo claro y oscuro
export const ESTADO_PEDIDO_CLASS: Record<EstadoPedido, string> = {
  pendiente: "bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-200",
  en_preparacion: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  listo: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  pagado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  anulado: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
}
