import type { CSSProperties } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { tonoDe } from "@/modules/mercado/tono"
import { AvatarTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { listarProductos, obtenerTienda } from "@/modules/mercado/datos"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { cn } from "@/shared/utils/cn"

export async function generateMetadata({ params }: { params: Promise<{ subdominio: string }> }) {
  const tienda = await obtenerTienda((await params).subdominio)
  return { title: tienda ? `${tienda.nombre} | OTemu` : "Tienda | OTemu" }
}

export default async function PaginaTienda({ params }: { params: Promise<{ subdominio: string }> }) {
  const { subdominio } = await params
  const tienda = await obtenerTienda(subdominio)
  if (!tienda) notFound()
  const { datos: productos } = await listarProductos({ tienda: subdominio, tamano: 24 })

  return (
    <>
      <section
        style={{ "--t": tonoDe(tienda.subdominio) } as CSSProperties}
        className="border-b border-island-border bg-[linear-gradient(160deg,hsl(var(--t)_90%_94%),hsl(calc(var(--t)+40)_85%_90%))] dark:bg-[linear-gradient(160deg,hsl(var(--t)_40%_14%),hsl(calc(var(--t)+40)_45%_10%))]"
      >
        <div className={cn(claseContenedor, "flex flex-wrap items-center gap-5 py-10 sm:py-14")}>
          <AvatarTienda tienda={tienda} className="size-20 rounded-3xl text-[32px]" />
          <div className="min-w-0 flex-1">
            <nav aria-label="Ruta" className="mb-1 text-[13px] font-semibold text-muted-foreground">
              <Link href="/mercado/tiendas" className="hover:text-foreground hover:underline">
                Tiendas
              </Link>
            </nav>
            <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[42px]">{tienda.nombre}</h1>
            <p className="mt-1 text-[14px] font-medium text-muted-foreground">{tienda.cantidad_productos} {tienda.cantidad_productos === 1 ? "producto" : "productos"} · {tienda.subdominio}.otemu</p>
          </div>
        </div>
      </section>
      <div className={cn(claseContenedor, "py-10")}>
        <p className="max-w-2xl text-[16px] font-medium leading-relaxed text-foreground">{tienda.descripcion ?? "Tienda independiente en OTemu."}</p>
        <h2 className="mt-10 text-[24px] font-extrabold tracking-tight text-foreground">
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <li key={p.id}>
              <TarjetaProducto producto={p} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
