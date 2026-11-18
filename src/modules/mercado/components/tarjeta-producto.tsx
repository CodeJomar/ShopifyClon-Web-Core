import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { tonoDe } from "../tono"
import { ImagenProducto } from "./imagen-producto"
import { Estrellas } from "@/modules/resenas/components/estrellas"
import type { ProductoMercado } from "@/dtos/mercado"

/**
 * Producto en una lista del mercado. La imagen ocupa toda la tarjeta y los datos se leen sobre un degradado oscuro con un velo de vidrio
 * que se funde con la foto (no hay un corte entre «imagen» y «descripción»). Toda la tarjeta es un solo enlace al detalle.
 */
export function TarjetaProducto({ producto, className }: { producto: ProductoMercado; className?: string }) {
  const rebaja = producto.precio_comparacion_desde && producto.precio_comparacion_desde > producto.precio_desde ? producto.precio_comparacion_desde : null
  const descuento = rebaja ? Math.round((1 - producto.precio_desde / rebaja) * 100) : 0

  return (
    <Link
      href={`/mercado/tienda/${producto.tienda.subdominio}/${producto.identificador_url}`}
      className={cn(
        "group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-black outline-none",
        "shadow-[0_20px_50px_-28px_rgb(0_0_0/0.8)] transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_0_34px_-6px_rgb(0_230_153/0.65),0_20px_50px_-28px_rgb(0_0_0/0.8)] focus-visible:border-primary",
        className,
      )}
    >
      {/* Imagen a tarjeta completa */}
      <div className={cn("absolute inset-0 -z-10", !producto.hay_stock && "opacity-60 grayscale-[0.4]")}>
        <ImagenProducto tono={tonoDe(producto.tienda.subdominio)} src={producto.imagen_url} titulo={producto.titulo} className="transition-transform duration-700 group-hover:scale-[1.06]" />
      </div>

      {/* Etiquetas arriba: descuento / digital a la izquierda, precio a la derecha */}
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {descuento > 0 && <span className="rounded-lg bg-[#E91E63] px-2 py-1 text-[11px] font-extrabold text-white">-{descuento}%</span>}
          {producto.es_digital && <span className="rounded-lg border border-white/20 bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">Digital</span>}
        </div>
        <span className="rounded-lg bg-primary px-2.5 py-1 text-[13px] font-extrabold text-sobre-marca shadow-[0_6px_18px_-6px_rgb(0_230_153/0.8)]">
          {formatearDinero(producto.precio_desde, producto.moneda)}
        </span>
      </div>

      {/* Velo inferior: degradado oscuro + desenfoque que aparece poco a poco, para que el texto se lea sin cortar la imagen */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-[62%] bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-[4] h-[50%] backdrop-blur-md [mask-image:linear-gradient(to_top,black_30%,transparent)]"
      />

      <div className="relative flex flex-col gap-1.5 p-4 pt-10">
        <p className="truncate text-[11.5px] font-bold uppercase tracking-wider text-white/65">{producto.tienda.nombre}</p>
        <h3 className="line-clamp-2 text-[17px] font-extrabold leading-snug tracking-tight text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.6)]">{producto.titulo}</h3>
        <Estrellas promedio={producto.calificacion_promedio} cantidad={producto.cantidad_resenas} />
        <div className="mt-2 flex items-center justify-between gap-2">
          {rebaja ? <p className="text-[12.5px] font-medium text-white/60 line-through">{formatearDinero(rebaja, producto.moneda)}</p> : <span />}
          {producto.hay_stock ? (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[12.5px] font-extrabold text-sobre-marca transition-all group-hover:gap-2.5 group-hover:shadow-[0_0_20px_-2px_rgb(0_230_153/0.9)]">
              Ver producto <ArrowRight aria-hidden="true" className="size-3.5" />
            </span>
          ) : (
            <span className="inline-flex h-8 items-center rounded-full border border-white/25 px-3.5 text-[12.5px] font-bold text-white/80">Agotado</span>
          )}
        </div>
      </div>
    </Link>
  )
}
