import { Ban, Banknote, CircleCheck, CreditCard, Landmark, Smartphone, Undo2, type LucideIcon } from "lucide-react"
import type { MetodoPago } from "@/dtos/caja"
import type { EstadoPedido } from "@/dtos/pedidos"
import type { GrupoPedido, ResultadoArqueo } from "../schema"

/* -------------------------------------------------------------------------- */
/*                         Configuración visual por dominio                   */
/* -------------------------------------------------------------------------- */

export const METODO_PAGO_ICONS: Record<MetodoPago, LucideIcon> = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  yape: Smartphone,
  plin: Smartphone,
  transferencia: Landmark,
}

// Estilo del estado de un pedido en el historial
export const ESTADO_PEDIDO_CONFIG: Record<EstadoPedido, { badge: string; dot: string }> = {
  pendiente: {
    badge: "bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-200",
    dot: "bg-slate-400",
  },
  en_preparacion: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  listo: {
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  pagado: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  anulado: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    dot: "bg-red-500",
  },
}

export const GRUPO_PEDIDO_CHIPS: Array<GrupoPedido | "todos"> = ["todos", "activo", "pagado", "anulado"]

export const RESULTADO_ARQUEO_CONFIG: Record<ResultadoArqueo, { badge: string; texto: string }> = {
  cuadrado: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    texto: "text-emerald-700 dark:text-emerald-400",
  },
  sobrante: {
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    texto: "text-sky-700 dark:text-sky-400",
  },
  faltante: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    texto: "text-red-700 dark:text-red-400",
  },
}

// Línea de tiempo del comprobante: cobros y devoluciones
export const EVENTO_PAGO_CONFIG: Record<"pago" | "devolucion", { icon: LucideIcon; className: string }> = {
  pago: {
    icon: CircleCheck,
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  devolucion: {
    icon: Undo2,
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  },
}

export const ICONO_ANULADO = Ban
