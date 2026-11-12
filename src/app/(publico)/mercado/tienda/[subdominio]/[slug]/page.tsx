import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, MapPin, PackageCheck, Star, Truck } from "lucide-react"
import { AgregarAlCarrito } from "@/modules/mercado/components/agregar-al-carrito"
import { ImagenProducto } from "@/modules/mercado/components/imagen-producto"
import { AvatarTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { CATEGORIAS, listarProductos, obtenerProducto } from "@/modules/mercado/datos"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"

type Props = { params: Promise<{ subdominio: string; slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { subdominio, slug } = await params
  const producto = await obtenerProducto(subdominio, slug)
  return { title: producto ? `${producto.titulo} | ${producto.tienda.nombre}` : "Producto | OTemu", description: producto?.descripcion }
}

export default async function DetalleProducto({ params }: Props) {
  const { subdominio, slug } = await params
  const producto = await obtenerProducto(subdominio, slug)
  if (!producto) notFound()
  const categoria = CATEGORIAS.find((c) => c.id === producto.categoria_id)
  const { datos: otros } = await listarProductos({ tienda: subdominio, por_pagina: 5 })
  const masDeLaTienda = otros.filter((p) => p.id !== producto.id).slice(0, 4)
  const rebaja = producto.precio_comparacion && producto.precio_comparacion > producto.precio ? producto.precio_comparacion : null

  return (
    <div className={cn(claseContenedor, "py-8 sm:py-12")}>
      <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
        <Link href="/mercado" className="hover:text-foreground hover:underline">Mercado</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/mercado/tienda/${producto.tienda.subdominio}`} className="hover:text-foreground hover:underline">{producto.tienda.nombre}</Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="aspect-square overflow-hidden rounded-[28px] border border-island-border shadow-isla">
          <ImagenProducto tono={producto.tienda.tono} icono={categoria?.icono ?? "arte"} titulo={producto.titulo} />
        </div>

        <div className="flex flex-col">
          <Link
            href={`/mercado/tienda/${producto.tienda.subdominio}`}
            className="inline-flex w-fit items-center gap-2.5 rounded-xl pr-2 text-[14px] font-bold text-foreground outline-none hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <AvatarTienda tienda={producto.tienda} className="size-9 rounded-xl text-[15px]" />
            {producto.tienda.nombre}
          </Link>

          <h1 className="mt-4 text-balance text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[38px]">{producto.titulo}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-muted-foreground">
            <Star aria-hidden="true" className="size-4 fill-warning text-warning" />
            {producto.calificacion.toFixed(1)} <span className="font-medium">({producto.resenas} reseñas)</span>
          </p>

          <p className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-[38px] font-extrabold leading-none tracking-tight text-foreground">{formatearDinero(producto.precio, producto.moneda)}</span>
            {rebaja && <span className="text-[17px] font-medium text-muted-foreground line-through">{formatearDinero(rebaja, producto.moneda)}</span>}
            {rebaja && <span className="rounded-full bg-destructive px-2.5 py-1 text-[12px] font-extrabold text-white">-{Math.round((1 - producto.precio / rebaja) * 100)}%</span>}
          </p>

          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground">{producto.descripcion}</p>

          <div className="mt-8">
            <AgregarAlCarrito producto={producto} />
          </div>

          <ul className="mt-8 space-y-3 rounded-2xl border border-island-border bg-card p-5 text-[14px] font-medium text-foreground">
            <li className="flex items-center gap-3">
              {producto.es_digital ? <Download aria-hidden="true" className="size-5 text-brand-text" /> : <Truck aria-hidden="true" className="size-5 text-brand-text" />}
              {producto.es_digital ? "Producto digital: lo recibes por correo, sin envío." : "Lo despacha la tienda y puedes seguir el envío en tu pedido."}
            </li>
            {!producto.es_digital && (
              <li className="flex items-center gap-3">
                <MapPin aria-hidden="true" className="size-5 text-brand-text" />
                Despacha desde {producto.despacha_desde}.
              </li>
            )}
            <li className="flex items-center gap-3">
              <PackageCheck aria-hidden="true" className="size-5 text-brand-text" />
              Pagas una sola vez aunque agregues productos de otras tiendas.
            </li>
          </ul>
        </div>
      </div>

      {masDeLaTienda.length > 0 && (
        <section className="mt-16" aria-labelledby="mas-titulo">
          <h2 id="mas-titulo" className="text-[24px] font-extrabold tracking-tight text-foreground">Más de {producto.tienda.nombre}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {masDeLaTienda.map((p) => (
              <li key={p.id}>
                <TarjetaProducto producto={p} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
