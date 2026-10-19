"use client"

import { cn } from "@/shared/utils/cn"
import { getCategoriaConfig } from "@/shared/utils/categoria-visual"
import { formatearDinero } from "@/shared/utils/dinero"

import type { ProductoCatalogo, ProductoPos } from "../schema"

/**
 * Producto del catálogo: foto (o el ícono de su categoría si no tiene), nombre, descripción y precio. Toda la tarjeta
 * es el botón: al tocarla se abre el panel de extras y nota, y desde ahí se agrega a la comanda.
 */
export function ProductoCard({
  producto,
  cantidad,
  deshabilitado,
  onSeleccionar,
}: {
  producto: ProductoCatalogo
  cantidad: number
  deshabilitado: boolean
  onSeleccionar: (producto: ProductoPos) => void
}) {
  const config = getCategoriaConfig({ nombre: producto.categoria_nombre })
  const Icono = config.icon
  const agotado = !producto.disponible
  const puedeAgregar = !agotado && !deshabilitado

  return (
    <button
      type="button"
      id={`pos-producto-${producto.id_producto}`}
      disabled={!puedeAgregar}
      onClick={() => onSeleccionar(producto)}
      aria-label={agotado ? `${producto.nombre}, agotado` : `Agregar ${producto.nombre}`}
      className={cn(
        "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all",
        "border-slate-100 hover:border-[#4C0107]/30 hover:shadow-md active:scale-[0.98]",
        "dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:shadow-black/40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C0107] dark:focus-visible:outline-[#E7B7BC]",
        "disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100",
        cantidad > 0 && "border-[#4C0107]/50 ring-1 ring-[#4C0107]/20 dark:border-[#E7B7BC]/50 dark:ring-[#E7B7BC]/20",
      )}
    >
      {/* Foto del producto; sin foto, el ícono de su categoría sobre un fondo tenue */}
      <span className={cn("relative flex h-20 w-full shrink-0 items-center justify-center overflow-hidden", config.className, agotado && "opacity-60")}>
        {producto.imagen_url ? (
          // Foto cargada por URL externa: no pasa por el optimizador de next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen_url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <Icono className="size-9 opacity-80 transition-transform duration-300 group-hover:scale-110" />
        )}

        {cantidad > 0 && (
          <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#4C0107] px-1.5 text-xs font-bold tabular-nums text-white shadow dark:bg-stone-100 dark:text-stone-900">
            {cantidad}
          </span>
        )}
        {agotado && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Agotado
          </span>
        )}
      </span>

      <span className="flex min-h-0 w-full flex-1 flex-col justify-between gap-1.5 p-2.5">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("block truncate text-sm font-semibold text-slate-900 dark:text-stone-100", agotado && "text-slate-500 dark:text-stone-400")}>
            {producto.nombre}
          </span>
          <span className="line-clamp-1 block text-xs text-slate-500 dark:text-stone-400">{producto.descripcion || producto.categoria_nombre}</span>
        </span>

        <span className="block text-base font-bold tabular-nums text-[#4C0107] dark:text-[#E7B7BC]">{formatearDinero(producto.precio)}</span>
      </span>
    </button>
  )
}
