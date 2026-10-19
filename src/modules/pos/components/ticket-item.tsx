"use client"

import { Minus, Plus } from "lucide-react"
import { aCentimos, formatearCentimos } from "@/shared/utils/dinero"
import { MAX_CANTIDAD_ITEM, precioUnitarioCentimos, subtotalLineaCentimos, type ItemCarrito } from "../schema"

export function TicketItem({
  item,
  agotado,
  onCambiarCantidad,
  onQuitar,
}: {
  item: ItemCarrito
  agotado: boolean
  onCambiarCantidad: (uid: string, delta: number) => void
  onQuitar: (uid: string) => void
}) {
  const { producto, cantidad, modificadores, notas } = item
  const precioUnitario = precioUnitarioCentimos(item)
  const botonCantidad =
    "flex size-7 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-white hover:text-[#4C0107] disabled:opacity-40 disabled:cursor-not-allowed dark:text-stone-200 dark:hover:bg-stone-700 dark:hover:text-white cursor-pointer"

  return (
    <li className="flex flex-col gap-1.5 py-3 animate-in fade-in-0 slide-in-from-right-2 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-stone-100">{producto.nombre}</span>
          <span className="text-xs tabular-nums text-slate-500 dark:text-stone-400">{formatearCentimos(precioUnitario)} c/u</span>
          {agotado && (
            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">Agotado: no se pueden agregar más unidades</span>
          )}
        </div>

        {/* Selector de cantidad */}
        <div className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5 dark:bg-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => onCambiarCantidad(item.uid, -1)}
            aria-label={`Quitar una unidad de ${producto.nombre}`}
            className={botonCantidad}
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-900 dark:text-stone-100" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => onCambiarCantidad(item.uid, 1)}
            disabled={agotado || cantidad >= MAX_CANTIDAD_ITEM}
            aria-label={`Agregar una unidad de ${producto.nombre}`}
            className={botonCantidad}
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Total por línea */}
        <div className="flex w-20 shrink-0 flex-col items-end text-right">
          <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-stone-100">
            {formatearCentimos(subtotalLineaCentimos(item))}
          </span>
          <button
            type="button"
            onClick={() => onQuitar(item.uid)}
            className="text-[11px] font-medium text-slate-400 transition-colors hover:text-red-600 dark:text-stone-500 dark:hover:text-red-400 cursor-pointer"
          >
            Quitar
          </button>
        </div>
      </div>

      {/* Opciones elegidas y nota de preparación */}
      {(modificadores.length > 0 || notas) && (
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/70 p-2 text-[11px] dark:bg-stone-800/60">
          {modificadores.map((m) => (
            <span
              key={m.id_opcion}
              className="rounded-md bg-white px-1.5 py-0.5 font-medium text-slate-700 dark:bg-stone-900 dark:text-stone-300"
            >
              {m.opcion}
              {aCentimos(m.price_delta) !== 0 && ` (${aCentimos(m.price_delta) > 0 ? "+" : "-"}${formatearCentimos(Math.abs(aCentimos(m.price_delta)))})`}
            </span>
          ))}
          {notas && <span className="w-full text-slate-600 dark:text-stone-400 italic">Nota: &quot;{notas}&quot;</span>}
        </div>
      )}
    </li>
  )
}
