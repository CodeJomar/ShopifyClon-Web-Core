"use client"

import Link from "next/link"
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react"
import { claseBotonContorno, claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { CATEGORIAS } from "../datos"
import { ImagenProducto } from "../components/imagen-producto"
import { AvatarTienda } from "../components/tarjeta-tienda"
import { agruparPorTienda, useCarritoEjemplo } from "../carrito-mock"

/** Carrito con productos de varias tiendas, agrupado por tienda y con un solo total. */
export function CarritoGlobalView() {
  const { lineas, listo, cambiarCantidad, quitar, vaciar } = useCarritoEjemplo()
  const grupos = agruparPorTienda(lineas)
  const total = grupos.reduce((s, g) => s + g.subtotal, 0)

  if (!listo) {
    return <div className={cn(claseContenedor, "py-14")} aria-busy="true" aria-label="Cargando tu carrito" />
  }

  if (lineas.length === 0) {
    return (
      <div className={cn(claseContenedor, "flex flex-col items-center py-24 text-center")}>
        <span className="flex size-16 items-center justify-center rounded-3xl bg-primary/14 text-brand-text">
          <ShoppingBag aria-hidden="true" className="size-8" strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-foreground">Tu carrito está vacío</h1>
        <p className="mt-2 max-w-md text-[15px] text-muted-foreground">Agrega productos de una o varias tiendas y paga todo junto.</p>
        <Link href="/mercado" className={cn(claseBotonMarca, "mt-7")}>
          Explorar el mercado
        </Link>
      </div>
    )
  }

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">Mi carrito</h1>
        <button type="button" onClick={vaciar} className="rounded text-[13.5px] font-bold text-muted-foreground outline-none hover:text-destructive-text focus-visible:ring-[3px] focus-visible:ring-ring/40">
          Vaciar carrito
        </button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {grupos.map((g) => (
            <section key={g.tienda.id} aria-label={`Productos de ${g.tienda.nombre}`} className="overflow-hidden rounded-3xl border border-island-border bg-card shadow-isla">
              <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <Link href={`/mercado/tienda/${g.tienda.subdominio}`} className="flex items-center gap-3 rounded-lg outline-none hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/40">
                  <AvatarTienda tienda={g.tienda} className="size-10 rounded-xl text-[16px]" />
                  <span className="text-[15px] font-extrabold tracking-tight">{g.tienda.nombre}</span>
                </Link>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  Subtotal <span className="ml-1 text-[15px] font-extrabold text-foreground">{formatearDinero(g.subtotal, "PEN")}</span>
                </p>
              </header>
              <ul className="divide-y divide-border/60">
                {g.lineas.map((l) => (
                  <li key={l.producto.id} className="flex gap-4 px-5 py-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-2xl">
                      <ImagenProducto tono={l.producto.tienda.tono} icono={CATEGORIAS.find((c) => c.id === l.producto.categoria_id)?.icono ?? "arte"} titulo={l.producto.titulo} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/mercado/tienda/${l.producto.tienda.subdominio}/${l.producto.slug}`} className="line-clamp-2 text-[14.5px] font-bold leading-snug text-foreground hover:text-brand-text">
                        {l.producto.titulo}
                      </Link>
                      <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">{formatearDinero(l.producto.precio, "PEN")} c/u</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        <div className="flex h-9 items-center rounded-lg border-[1.8px] border-input" role="group" aria-label={`Cantidad de ${l.producto.titulo}`}>
                          <button type="button" aria-label="Una unidad menos" disabled={l.cantidad <= 1} onClick={() => cambiarCantidad(l.producto.id, l.cantidad - 1)} className="flex size-9 items-center justify-center rounded-l-lg outline-none hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40">
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>
                          <output aria-live="polite" className="w-8 text-center text-[14px] font-extrabold">{l.cantidad}</output>
                          <button type="button" aria-label="Una unidad más" disabled={l.cantidad >= 20} onClick={() => cambiarCantidad(l.producto.id, l.cantidad + 1)} className="flex size-9 items-center justify-center rounded-r-lg outline-none hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40">
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <button type="button" onClick={() => quitar(l.producto.id)} className="inline-flex items-center gap-1.5 rounded text-[13px] font-semibold text-muted-foreground outline-none hover:text-destructive-text focus-visible:ring-[3px] focus-visible:ring-ring/40">
                          <Trash2 className="size-3.5" aria-hidden="true" /> Quitar
                        </button>
                      </div>
                    </div>
                    <p className="text-[15px] font-extrabold tracking-tight text-foreground">{formatearDinero(l.producto.precio * l.cantidad, "PEN")}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside aria-label="Resumen del pedido" className="rounded-3xl bg-primary/60 p-px lg:sticky lg:top-24">
          <div className="rounded-[23px] bg-card p-6">
            <h2 className="text-[18px] font-extrabold tracking-tight text-foreground">Resumen</h2>
            <dl className="mt-4 space-y-2.5 text-[14px]">
              {grupos.map((g) => (
                <div key={g.tienda.id} className="flex justify-between gap-3">
                  <dt className="truncate font-medium text-muted-foreground">{g.tienda.nombre}</dt>
                  <dd className="font-bold text-foreground">{formatearDinero(g.subtotal, "PEN")}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-t border-border/60 pt-3 text-[13px]">
                <dt className="font-medium text-muted-foreground">Envío</dt>
                <dd className="font-semibold text-muted-foreground">Se calcula al continuar</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-3">
                <dt className="text-[15px] font-bold text-foreground">Total de productos</dt>
                <dd className="text-[26px] font-extrabold tracking-tight text-foreground">{formatearDinero(total, "PEN")}</dd>
              </div>
            </dl>
            <Link href="/checkout" className={cn(claseBotonMarca, "mt-6 w-full")}>
              Continuar con la compra
            </Link>
            <Link href="/mercado" className={cn(claseBotonContorno, "mt-2.5 w-full")}>
              Seguir comprando
            </Link>
            <p className="mt-5 flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-text" />
              Con tarjeta pagas una sola vez y repartimos el dinero entre las {grupos.length === 1 ? "tienda" : `${grupos.length} tiendas`}. Con transferencia o Yape, cada tienda confirma su parte.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
