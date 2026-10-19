"use client"

import { getCategoriaConfig } from "@/shared/utils/categoria-visual"
import { CircleAlert, CircleCheck, Lock, Pencil, RefreshCw, Trash2 } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/cn"
import { formatearDinero } from "@/shared/utils/dinero"
import { type ProductoMenu } from "../schema"
import { ESTADO_PRODUCTO_CLASS } from "./estilos"

/* -------------------------------------------------------------------------- */
/*                              Tarjeta producto                              */
/* -------------------------------------------------------------------------- */

export function ProductoCard({
  producto,
  categoria,
  pendiente,
  puedeCambiarStock,
  puedeEditar,
  puedeEliminar,
  onToggle,
  onEditar,
  onEliminar,
}: {
  producto: ProductoMenu
  categoria: string
  pendiente: boolean
  puedeCambiarStock: boolean
  puedeEditar: boolean
  puedeEliminar: boolean
  onToggle: (producto: ProductoMenu) => void
  onEditar: (producto: ProductoMenu) => void
  onEliminar: (producto: ProductoMenu) => void
}) {
  const config = getCategoriaConfig({ nombre: categoria })
  const Icono = config.icon
  const agotado = !producto.disponible

  return (
    <article
      className={cn(
        "group flex h-full flex-col justify-between gap-3 rounded-2xl border bg-white p-4 transition-all duration-200 shadow-xs hover:shadow-md",
        "border-slate-100 dark:border-stone-800 dark:bg-stone-900",
        agotado && "border-red-200 bg-red-50/40 dark:border-red-500/25 dark:bg-red-500/5"
      )}
    >
      {/* Cabecera de la tarjeta con categoría y badge de disponibilidad */}
      <div className="flex items-start justify-between gap-3 shrink-0">
        {producto.imagen_url ? (
          // Foto cargada por URL externa: no pasa por el optimizador de next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen_url} alt="" loading="lazy" className="size-12 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", config.className)}>
            <Icono className="size-5" />
          </span>
        )}
        <Badge
          variant="estado"
          className={cn(
            "text-[11px] uppercase tracking-wide",
            agotado ? ESTADO_PRODUCTO_CLASS.agotado : ESTADO_PRODUCTO_CLASS.disponible
          )}
        >
          {agotado ? "Agotado" : "Disponible"}
        </Badge>
      </div>

      {/* Información del producto (flex-1 para absorber espacio y alinear pie) */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3
          className={cn(
            "truncate text-sm font-bold text-slate-900 dark:text-stone-100",
            agotado && "text-slate-500 line-through decoration-1 dark:text-stone-400"
          )}
        >
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 text-xs text-slate-500 dark:text-stone-400 leading-relaxed">
          {producto.descripcion || "Sin descripción"}
        </p>
        <p className="mt-auto pt-1 text-[11px] font-medium text-slate-400 dark:text-stone-500">
          {categoria}
          {producto.grupos_modificadores.length > 0 && " · Personalizable"}
        </p>
      </div>

      {/* Pie de la tarjeta con precio y acciones ancladas a la misma altura */}
      <div className="mt-auto shrink-0 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-stone-800 min-h-[52px]">
        <span className="text-base font-black tabular-nums text-[#4C0107] dark:text-[#E7B7BC] truncate">
          {formatearDinero(producto.precio)}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {puedeEditar && (
            <button
              type="button"
              onClick={() => onEditar(producto)}
              aria-label={`Editar ${producto.nombre}`}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 shrink-0"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {puedeEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(producto)}
              aria-label={`Eliminar ${producto.nombre}`}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          )}

          {/* RF-10: alternar con un solo toque Disponible / Agotado */}
          {puedeCambiarStock ? (
            <button
              type="button"
              onClick={() => onToggle(producto)}
              disabled={pendiente}
              aria-pressed={agotado}
              aria-label={agotado ? `Marcar ${producto.nombre} como disponible` : `Marcar ${producto.nombre} como agotado`}
              className={cn(
                "inline-flex h-9 min-w-[105px] sm:min-w-32 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-70 truncate shrink-0",
                agotado
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
                  : "border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
              )}
            >
              {pendiente ? (
                <RefreshCw className="size-3.5 animate-spin shrink-0" />
              ) : agotado ? (
                <CircleCheck className="size-3.5 shrink-0" />
              ) : (
                <CircleAlert className="size-3.5 shrink-0" />
              )}
              <span className="truncate">{agotado ? "Habilitar" : "Agotado"}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-stone-500 shrink-0">
              <Lock className="size-3.5" /> Solo lectura
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
