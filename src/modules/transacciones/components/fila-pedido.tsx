"use client"

import { Ban, Eye } from "lucide-react"
import type { PedidoListadoDto } from "@/dtos/pedidos"
import { cn } from "@/shared/utils/cn"
import { aCentimos, formatearDinero } from "@/shared/utils/dinero"
import { ESTADO_PEDIDO_LABELS, numeroPedido } from "../schema"
import { ESTADO_PEDIDO_CONFIG } from "./config-visual"
import { formatFechaHora, lugarDe } from "../utils"
import { columnasPedido } from "./seccion-historial-pedidos"

export function FilaPedido({
  pedido,
  puedeAnular,
  onVerDetalle,
  onAnular,
}: {
  pedido: PedidoListadoDto
  puedeAnular: boolean
  onVerDetalle: () => void
  onAnular: () => void
}) {
  const conf = ESTADO_PEDIDO_CONFIG[pedido.estado]
  const codigo = numeroPedido(pedido.correlativo)
  // Solo se anula lo que está en curso y todavía no tiene cobros
  const sePuedeAnular = puedeAnular && pedido.estado !== "anulado" && pedido.estado !== "pagado" && aCentimos(pedido.total_pagado) === 0
  const conSaldo = pedido.estado !== "anulado" && aCentimos(pedido.saldo_pendiente) > 0 && aCentimos(pedido.total_pagado) > 0

  const badgeEstado = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        conf.badge
      )}
    >
      <span className={cn("size-1.5 rounded-full", conf.dot)} />
      {ESTADO_PEDIDO_LABELS[pedido.estado]}
      {conSaldo && <span className="opacity-70">· parcial</span>}
      {pedido.estado_pago === "devuelto" || pedido.estado_pago === "devuelto_parcial" ? (
        <span className="opacity-70">· {pedido.estado_pago === "devuelto" ? "devuelto" : "dev. parcial"}</span>
      ) : null}
    </span>
  )

  const botonTexto = "rounded-lg px-2 py-1 text-xs font-semibold transition-colors cursor-pointer"
  const botonIcono = "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"

  return (
    <div className="h-full border-b border-slate-100 text-xs transition-colors hover:bg-slate-100/50 dark:border-stone-800/80 dark:hover:bg-stone-900/60">
      {/* Móvil: dos líneas compactas */}
      <div className="flex h-full flex-col justify-center gap-1 md:hidden">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-bold text-slate-900 dark:text-stone-100">{codigo}</span>
            <span className="truncate text-slate-700 dark:text-stone-300">{lugarDe(pedido)}{pedido.cliente_nombre ? ` · ${pedido.cliente_nombre}` : ""}</span>
          </span>
          <span className="shrink-0 font-bold tabular-nums text-slate-900 dark:text-stone-100">
            {formatearDinero(pedido.total_calculado)}
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            {badgeEstado}
            <span className="truncate text-slate-500 dark:text-stone-400">{formatFechaHora(pedido.fecha_creacion)}</span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onVerDetalle}
              aria-label={`Detalle de ${codigo}`}
              className={cn(botonIcono, "text-slate-600 hover:bg-slate-200/60 dark:text-stone-300 dark:hover:bg-stone-800")}
            >
              <Eye className="size-4" />
            </button>
            {sePuedeAnular && (
              <button
                type="button"
                onClick={onAnular}
                aria-label={`Anular ${codigo}`}
                className={cn(botonIcono, "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15")}
              >
                <Ban className="size-4" />
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Tablet y escritorio: una fila con columnas */}
      <div className={cn("hidden h-full", columnasPedido)}>
        <span className="truncate font-bold text-slate-900 dark:text-stone-100">{codigo}</span>
        <span className="truncate text-slate-700 dark:text-stone-300">{lugarDe(pedido)}{pedido.cliente_nombre ? ` · ${pedido.cliente_nombre}` : ""}</span>
        <span className="truncate text-slate-600 dark:text-stone-400">{formatFechaHora(pedido.fecha_creacion)}</span>
        <span className="hidden truncate text-slate-600 xl:block dark:text-stone-400">{pedido.total_items}</span>
        <span className="truncate text-right font-bold tabular-nums text-slate-900 dark:text-stone-100">
          {formatearDinero(pedido.total_calculado)}
        </span>
        <span className="text-center">{badgeEstado}</span>
        {/* Entre tablet y laptop: acciones como íconos para dar espacio a las columnas */}
        <span className="flex items-center justify-end gap-0.5 xl:hidden">
          <button
            type="button"
            onClick={onVerDetalle}
            aria-label={`Detalle de ${codigo}`}
            title="Detalle"
            className={cn(botonIcono, "text-slate-600 hover:bg-slate-200/60 dark:text-stone-300 dark:hover:bg-stone-800")}
          >
            <Eye className="size-4" />
          </button>
          {sePuedeAnular && (
            <button
              type="button"
              onClick={onAnular}
              aria-label={`Anular ${codigo}`}
              title="Anular"
              className={cn(botonIcono, "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15")}
            >
              <Ban className="size-4" />
            </button>
          )}
        </span>
        <span className="hidden items-center justify-end gap-1 xl:flex">
          <button
            type="button"
            onClick={onVerDetalle}
            className={cn(botonTexto, "text-slate-700 hover:bg-slate-200/60 dark:text-stone-300 dark:hover:bg-stone-800")}
          >
            Detalle
          </button>
          {sePuedeAnular && (
            <button
              type="button"
              onClick={onAnular}
              className={cn(botonTexto, "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15")}
            >
              Anular
            </button>
          )}
        </span>
      </div>
    </div>
  )
}
