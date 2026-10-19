"use client"

import { CheckCheck, Clock, Eye } from "lucide-react"
import type { TarjetaKdsDto } from "@/dtos/kds"
import type { EstadoItemKds } from "@/dtos/pedidos"
import { cn } from "@/shared/utils/cn"
import { codigoComanda, destinoComanda, minutosDesde, textoMinutos, TIPO_PEDIDO_LABELS } from "../schema"
import { ESTADO_COMANDA_CONFIG } from "./config-estados"
import { urgenciaClass } from "./estilos"
import { ItemFila } from "./item-fila"

/* -------------------------------------------------------------------------- */
/*                           Tarjeta de Comanda                                */
/* -------------------------------------------------------------------------- */

interface ComandaCardProps {
  tarjeta: TarjetaKdsDto
  ahora: number
  puedeDespachar: boolean
  procesando: ReadonlySet<string>
  onCambiarItem: (idItem: string, estado: EstadoItemKds) => Promise<boolean>
  onMarcarTodoListo: (tarjeta: TarjetaKdsDto) => Promise<boolean>
  onVerDetalle: () => void
}

export function ComandaCard({
  tarjeta,
  ahora,
  puedeDespachar,
  procesando,
  onCambiarItem,
  onMarcarTodoListo,
  onVerDetalle,
}: ComandaCardProps) {
  const estado = tarjeta.estado === "pendiente" || tarjeta.estado === "en_preparacion" ? tarjeta.estado : "pendiente"
  const config = ESTADO_COMANDA_CONFIG[estado]
  const Icono = config.icon
  const minutos = minutosDesde(tarjeta.fecha_creacion, ahora)
  const faltan = tarjeta.items.filter((i) => i.estado_kds !== "despachado").length
  const ocupada = tarjeta.items.some((i) => procesando.has(i.id_pedido_detalle))

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all duration-200 dark:bg-stone-900 overflow-hidden",
        config.border,
      )}
    >
      {/* Cabecera uniforme (shrink-0) */}
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-stone-800 dark:bg-stone-950/30 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-stone-100 text-sm sm:text-base truncate">
              {codigoComanda(tarjeta)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0",
                config.badge,
              )}
            >
              <Icono className="size-3" />
              {config.label}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold tabular-nums shrink-0 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-stone-800",
              urgenciaClass(minutos),
            )}
          >
            <Clock className="size-3.5" />
            {textoMinutos(minutos)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-stone-400">
          <span className="font-medium text-slate-700 dark:text-stone-200 truncate">
            {destinoComanda(tarjeta)}
            {tarjeta.cliente_nombre && <span className="font-normal text-slate-500 dark:text-stone-400"> · {tarjeta.cliente_nombre}</span>}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <span className="rounded-md bg-slate-200/60 dark:bg-stone-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-stone-300">
              {TIPO_PEDIDO_LABELS[tarjeta.tipo_pedido]}
            </span>
            <button
              type="button"
              onClick={onVerDetalle}
              title="Ver detalle completo"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 hover:bg-slate-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Eye className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Productos de la comanda (flex-1 para absorber espacio y empujar el footer) */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto max-h-[260px] sm:max-h-[320px] no-scrollbar">
        <ul className="flex flex-col gap-3">
          {tarjeta.items.map((item) => (
            <ItemFila
              key={item.id_pedido_detalle}
              item={item}
              puedeDespachar={puedeDespachar}
              deshabilitado={procesando.has(item.id_pedido_detalle)}
              onCambiar={onCambiarItem}
            />
          ))}
        </ul>
      </div>

      {/* Pie: una acción para terminar todo el pedido */}
      <div className="mt-auto shrink-0 border-t border-slate-100 bg-slate-50/40 p-3.5 dark:border-stone-800 dark:bg-stone-950/20 min-h-[58px] flex items-center">
        {puedeDespachar ? (
          <button
            type="button"
            onClick={() => void onMarcarTodoListo(tarjeta)}
            disabled={ocupada || faltan === 0}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#4C0107] px-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#4C0107]/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-slate-200"
          >
            <CheckCheck className="size-4 shrink-0" />
            <span className="truncate">{faltan === 0 ? "Todo listo" : `Marcar todo listo (${faltan})`}</span>
          </button>
        ) : (
          <span className="w-full text-center text-xs font-medium text-slate-500 dark:text-stone-400">
            {faltan === 0 ? "Todo listo" : `${faltan} por preparar`}
          </span>
        )}
      </div>
    </div>
  )
}
