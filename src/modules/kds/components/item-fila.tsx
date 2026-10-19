"use client"

import * as React from "react"
import { Undo2 } from "lucide-react"
import type { ItemKdsDto } from "@/dtos/kds"
import type { EstadoItemKds } from "@/dtos/pedidos"
import { cn } from "@/shared/utils/cn"
import { textoModificadores } from "../schema"
import { ESTADO_ITEM_CONFIG } from "./config-estados"

export function ItemFila({
  item,
  puedeDespachar,
  deshabilitado,
  onCambiar,
}: {
  item: ItemKdsDto
  puedeDespachar: boolean
  deshabilitado: boolean
  onCambiar: (idItem: string, estado: EstadoItemKds) => Promise<boolean>
}) {
  const estado = ESTADO_ITEM_CONFIG[item.estado_kds]
  const Icono = estado.icon
  const modificadores = textoModificadores(item)

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 text-sm leading-tight min-w-0">
          <span className="inline-flex min-w-[22px] h-5 items-center justify-center rounded bg-[#4C0107]/10 text-[#4C0107] dark:bg-stone-800 dark:text-stone-200 text-xs font-bold px-1 shrink-0">
            {item.cantidad}x
          </span>
          <span
            className={cn(
              "font-medium text-slate-800 dark:text-stone-200 text-xs sm:text-sm",
              item.completado && "text-slate-400 line-through dark:text-stone-500",
            )}
          >
            {item.nombre_producto}
          </span>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", estado.chip)}>
          <Icono className="size-3" />
          {estado.label}
        </span>
      </div>

      {modificadores && <span className="text-[11px] text-slate-500 dark:text-stone-400 pl-7 leading-tight">{modificadores}</span>}
      {item.notas_preparacion && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-1.5 py-0.5 w-fit ml-7">
          📝 {item.notas_preparacion}
        </span>
      )}

      {puedeDespachar && (
        <div className="flex flex-wrap items-center gap-1.5 pl-7">
          {item.estado_kds === "cola" && (
            <AccionItem texto="Preparar" disabled={deshabilitado} onClick={() => void onCambiar(item.id_pedido_detalle, "preparando")} />
          )}
          {item.estado_kds !== "despachado" && (
            <AccionItem texto="Listo" fuerte disabled={deshabilitado} onClick={() => void onCambiar(item.id_pedido_detalle, "despachado")} />
          )}
          {item.estado_kds === "preparando" && (
            <AccionItem
              texto="Regresar"
              icono={<Undo2 className="size-3" />}
              disabled={deshabilitado}
              onClick={() => void onCambiar(item.id_pedido_detalle, "cola")}
            />
          )}
          {item.estado_kds === "despachado" && (
            <AccionItem
              texto="Rehacer"
              icono={<Undo2 className="size-3" />}
              disabled={deshabilitado}
              onClick={() => void onCambiar(item.id_pedido_detalle, "preparando")}
            />
          )}
        </div>
      )}
    </li>
  )
}

function AccionItem({
  texto,
  icono,
  fuerte = false,
  disabled,
  onClick,
}: {
  texto: string
  icono?: React.ReactNode
  fuerte?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        fuerte
          ? "border-[#4C0107] bg-[#4C0107] text-white hover:bg-[#4C0107]/90 dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800",
      )}
    >
      {icono}
      {texto}
    </button>
  )
}
