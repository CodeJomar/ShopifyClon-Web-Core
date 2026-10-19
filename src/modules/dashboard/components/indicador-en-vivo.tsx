"use client"

import { DASHBOARD_REFRESH_MS } from "../schema"

export function IndicadorEnVivo({
  actualizadoEn,
  isRefreshing,
}: {
  actualizadoEn?: string
  isRefreshing: boolean
}) {
  const hora = actualizadoEn
    ? new Date(actualizadoEn).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null

  return (
    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400" aria-live="polite">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-semibold text-emerald-700 dark:text-emerald-400">En vivo</span>
      <span>·</span>
      <span>
        {isRefreshing
          ? "Actualizando…"
          : hora
            ? `Actualizado ${hora}`
            : "Conectando…"}
      </span>
      <span className="hidden sm:inline">· cada {DASHBOARD_REFRESH_MS / 1000} s</span>
    </div>
  )
}
