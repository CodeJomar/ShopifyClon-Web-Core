import Link from "next/link"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { tonoDe } from "../tono"
import { ImagenProducto } from "./imagen-producto"
import { Estrellas } from "@/modules/resenas/components/estrellas"
import type { ProductoMercado } from "@/dtos/mercado"

/** Producto en una lista del mercado. Toda la tarjeta es un solo enlace al detalle del producto. */
export function TarjetaProducto({ producto, className }: { producto: ProductoMercado; className?: string }) {
  const rebaja = producto.precio_comparacion_desde && producto.precio_comparacion_desde > producto.precio_desde ? producto.precio_comparacion_desde : null
  const descuento = rebaja ? Math.round((1 - producto.precio_desde / rebaja) * 100) : 0

  return (
    <Link
      href={`/mercado/tienda/${producto.tienda.subdominio}/${producto.identificador_url}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-island-border bg-card shadow-isla outline-none transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/30",
        !producto.hay_stock && "opacity-75",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImagenProducto tono={tonoDe(producto.tienda.subdominio)} src={producto.imagen_url} titulo={producto.titulo} className="transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {descuento > 0 && <span className="rounded-full bg-tono-peligro-bg px-2.5 py-1 text-[11px] font-extrabold text-tono-peligro-fg">-{descuento}%</span>}
          {producto.es_digital && <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-bold text-foreground backdrop-blur">Digital</span>}
        </div>
        {!producto.hay_stock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1.5 text-center text-[12px] font-bold text-background">Agotado</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="truncate text-[12px] font-semibold text-muted-foreground">{producto.tienda.nombre}</p>
        <Estrellas promedio={producto.calificacion_promedio} cantidad={producto.cantidad_resenas} />
        <h3 className="line-clamp-2 min-h-[2.6em] text-[14.5px] font-bold leading-snug tracking-tight text-foreground">{producto.titulo}</h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {rebaja && <p className="text-[12px] font-medium text-muted-foreground line-through">{formatearDinero(rebaja, producto.moneda)}</p>}
            <p className="text-[18px] font-extrabold tracking-tight text-foreground">{formatearDinero(producto.precio_desde, producto.moneda)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
