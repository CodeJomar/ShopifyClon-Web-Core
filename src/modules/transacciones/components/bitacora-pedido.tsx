"use client"

import { Ban, CircleCheck, Plus, Printer, Undo2, Redo2, type LucideIcon } from "lucide-react"

import type { AccionEventoPedido, EventoPedidoDto } from "@/dtos/pedidos"
import { cn } from "@/shared/utils/cn"

import { formatFechaHora } from "../utils"
import { textoCuerpo, textoEtiqueta, textoSecundario, textoTitulo } from "./estilos"

const ACCIONES: Record<AccionEventoPedido, { etiqueta: string; icon: LucideIcon; className: string }> = {
  creado: { etiqueta: "Pedido registrado", icon: Plus, className: "bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-200" },
  cobrado: { etiqueta: "Cobro registrado", icon: CircleCheck, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" },
  devuelto: { etiqueta: "Devolución registrada", icon: Undo2, className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" },
  anulado: { etiqueta: "Pedido anulado", icon: Ban, className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" },
  revertido: { etiqueta: "Estado revertido", icon: Redo2, className: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300" },
  reimpreso: { etiqueta: "Comprobante reimpreso", icon: Printer, className: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300" },
}

/** Bitácora del pedido: qué pasó, quién lo hizo y cuándo (de la más antigua a la más reciente). */
export function BitacoraPedido({ eventos }: { eventos: EventoPedidoDto[] }) {
  if (eventos.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <span className={textoEtiqueta}>Bitácora</span>
      <ol className="relative flex flex-col gap-4 border-l border-slate-200 pl-5 dark:border-stone-700">
        {eventos.map((evento, i) => {
          const conf = ACCIONES[evento.accion]
          const Icono = conf.icon
          return (
            <li key={`${evento.accion}-${evento.fecha}-${i}`} className="relative">
              <span
                className={cn(
                  "absolute -left-[31px] flex size-5 items-center justify-center rounded-full ring-4 ring-white dark:ring-stone-900",
                  conf.className
                )}
              >
                <Icono className="size-3" />
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className={cn("text-sm font-semibold", textoTitulo)}>{conf.etiqueta}</span>
                  {evento.fecha && <span className={cn("text-[11px] tabular-nums", textoSecundario)}>{formatFechaHora(evento.fecha)}</span>}
                </div>
                {evento.usuario && <span className={cn("text-xs", textoSecundario)}>Por {evento.usuario}</span>}
                {evento.detalle && <span className={cn("text-xs", textoCuerpo)}>{evento.detalle}</span>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
