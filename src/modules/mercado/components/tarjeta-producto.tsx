import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { tonoDe } from "../tono"
import { ImagenProducto } from "./imagen-producto"
import { Estrellas } from "@/modules/resenas/components/estrellas"
import type { ProductoMercado } from "@/dtos/mercado"

/**
 * Producto en una lista del mercado. La foto ocupa toda la tarjeta y los datos van en un panel de vidrio flotante abajo: a la izquierda
 * el nombre, la descripción y la calificación; a la derecha, separadas por una línea de color, las variantes del mismo producto.
 * Toda la tarjeta es un solo enlace al detalle.
 */
export function TarjetaProducto({ producto, className }: { producto: ProductoMercado; className?: string }) {
  const rebaja = producto.precio_comparacion_desde && producto.precio_comparacion_desde > producto.precio_desde ? producto.precio_comparacion_desde : null
  const descuento = rebaja ? Math.round((1 - producto.precio_desde / rebaja) * 100) : 0
  // La variante «Predeterminada» no aporta nada: solo se listan cuando hay opciones de verdad.
  const variantes = (producto.variantes_resumen ?? []).filter((v) => (producto.cantidad_variantes ?? 0) > 1 || v.titulo.toLowerCase() !== "predeterminada")
  const masVariantes = Math.max(0, (producto.cantidad_variantes ?? variantes.length) - variantes.length)

  return (
    <Link
      href={`/mercado/tienda/${producto.tienda.subdominio}/${producto.identificador_url}`}
      className={cn(
        "@container group relative isolate flex aspect-[3/4.35] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-black outline-none",
        "shadow-[0_20px_50px_-28px_rgb(0_0_0/0.8)] transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_0_34px_-6px_rgb(0_230_153/0.65),0_20px_50px_-28px_rgb(0_0_0/0.8)] focus-visible:border-primary",
        className,
      )}
    >
      {/* Foto a tarjeta completa */}
      <div className={cn("absolute inset-0 -z-10", !producto.hay_stock && "opacity-60 grayscale-[0.4]")}>
        <ImagenProducto tono={tonoDe(producto.tienda.subdominio)} src={producto.imagen_url} titulo={producto.titulo} className="transition-transform duration-700 group-hover:scale-[1.05]" />
      </div>
      {/* Velo inferior: degradado oscuro y desenfoque que se funden con la foto; no hay caja ni corte */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-[72%] bg-gradient-to-t from-black/95 via-black/75 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[4] h-[60%] backdrop-blur-md [mask-image:linear-gradient(to_top,black_35%,transparent)]" />

      {/* Etiquetas: descuento / digital a la izquierda, precio a la derecha */}
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {descuento > 0 && <span className="rounded-lg bg-[#E91E63] px-2 py-1 text-[11px] font-extrabold text-white">-{descuento}%</span>}
          {producto.es_digital && <span className="rounded-lg border border-white/20 bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">Digital</span>}
        </div>
        <span className="flex flex-col items-end">
          <span className="rounded-lg bg-primary px-3 py-1.5 text-[14px] font-extrabold text-sobre-marca shadow-[0_6px_18px_-6px_rgb(0_230_153/0.8)]">
            {formatearDinero(producto.precio_desde, producto.moneda)}
          </span>
          {rebaja && <span className="mt-1 rounded bg-black/50 px-1.5 text-[11.5px] font-medium text-white/70 line-through backdrop-blur-sm">{formatearDinero(rebaja, producto.moneda)}</span>}
        </span>
      </div>

      {/* Contenido sobre el velo: dos columnas (nombre y descripción | variantes) y el botón */}
      <div className="relative px-4 pb-4 pt-14">
        <div className={cn("grid gap-4", variantes.length > 0 && "@[19rem]:grid-cols-[1.25fr_auto_1fr]")}>
          <div className="min-w-0">
            <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.12em] text-primary">{producto.tienda.nombre}</p>
            <h3 className="mt-1 line-clamp-2 text-[18px] font-extrabold leading-[1.15] tracking-tight text-white">{producto.titulo}</h3>
            {producto.descripcion_corta && <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-snug text-white/65">{producto.descripcion_corta}</p>}
            <Estrellas promedio={producto.calificacion_promedio} cantidad={producto.cantidad_resenas} mostrarVacio className="mt-2" />
          </div>

          {variantes.length > 0 && (
            <>
              <span aria-hidden="true" className="hidden w-px bg-primary/80 shadow-[0_0_10px_rgb(0_230_153/0.7)] @[19rem]:block" />
              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Variantes</p>
                <ul className="space-y-1.5">
                  {variantes.map((v) => (
                    <li key={v.titulo} className="min-w-0">
                      <p className="truncate text-[11px] font-extrabold uppercase tracking-wide text-primary">{v.titulo}</p>
                      <p className="text-[12px] text-white/65">{formatearDinero(v.precio, producto.moneda)}</p>
                    </li>
                  ))}
                </ul>
                {masVariantes > 0 && <p className="text-[11.5px] font-semibold text-white/55">+{masVariantes} más</p>}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          {producto.hay_stock ? (
            <span className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-6 text-[13px] font-extrabold text-sobre-marca shadow-[0_8px_22px_-8px_rgb(0_230_153/0.9)] transition-all group-hover:gap-3 group-hover:shadow-[0_0_24px_-2px_rgb(0_230_153/0.95)]">
              Ver producto <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          ) : (
            <span className="inline-flex h-9 items-center rounded-full border border-white/25 px-6 text-[13px] font-bold text-white/80">Agotado</span>
          )}
        </div>
      </div>
    </Link>
  )
}
