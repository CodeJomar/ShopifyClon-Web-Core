"use client"

import { cn } from "@/shared/utils/cn"
import { textoAcento, textoEtiqueta, textoSecundario, textoTitulo } from "./estilos"

export function MetricCard({
  label,
  valor,
  sub,
  destacado = false,
}: {
  label: string
  valor: string
  sub?: string
  destacado?: boolean
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-2xl border p-3 transition-colors lg:p-3.5",
        destacado
          ? "border-[#4C0107]/30 bg-[#EDE5E6]/40 dark:border-[#E7B7BC]/30 dark:bg-stone-800/80"
          : "border-slate-100 bg-slate-50/70 dark:border-stone-800 dark:bg-stone-900"
      )}
    >
      <span className={cn("truncate", textoEtiqueta)}>{label}</span>
      <span
        className={cn(
          "truncate text-base font-bold tabular-nums tracking-tight lg:text-lg",
          destacado ? textoAcento : textoTitulo
        )}
      >
        {valor}
      </span>
      {/* En pantallas de poca altura se omite el detalle para que todo quepa */}
      {sub && <span className={cn("truncate text-[11px] [@media(max-height:700px)]:hidden", textoSecundario)}>{sub}</span>}
    </div>
  )
}
