"use client"

import * as React from "react"
import Link from "next/link"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { toast } from "@/shared/components/ui/toast"
import { claseBotonMarca } from "@/shared/components/marketing/estilos"
import { useCarrito } from "@/modules/carrito-global/carrito"
import type { VarianteVitrina } from "@/dtos/vitrina"

/** Selector de opción y cantidad, y botón «Agregar al carrito» del detalle de producto (carrito global de la API). */
export function AgregarAlCarrito({ titulo, variante, hayStock = true }: { titulo: string; variante?: VarianteVitrina; hayStock?: boolean }) {
  const { agregar } = useCarrito()
  const [cantidad, setCantidad] = React.useState(1)
  const [agregado, setAgregado] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)

  const confirmar = async () => {
    if (!variante) return
    setEnviando(true)
    const error = await agregar(variante.id, cantidad)
    setEnviando(false)
    if (error) {
      // CAR-009: el carrito es de una sola moneda; INV-*: sin stock suficiente.
      toast.add({ type: "error", title: "No pudimos agregarlo", description: error.message })
      return
    }
    setAgregado(true)
    toast.add({ type: "success", title: "Agregado al carrito", description: `${cantidad} × ${titulo}` })
  }

  if (!hayStock) {
    return <p className="rounded-xl bg-white/5 px-4 py-3 text-[14px] font-semibold text-muted-foreground">Este producto está agotado por ahora.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center rounded-xl border-[1.8px] border-input" role="group" aria-label="Cantidad">
          <button
            type="button"
            aria-label="Una unidad menos"
            disabled={cantidad <= 1}
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="flex size-11 items-center justify-center rounded-l-xl text-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <output aria-live="polite" className="w-10 text-center text-[15px] font-extrabold text-foreground">
            {cantidad}
          </output>
          <button
            type="button"
            aria-label="Una unidad más"
            disabled={cantidad >= 10}
            onClick={() => setCantidad((c) => Math.min(10, c + 1))}
            className="flex size-11 items-center justify-center rounded-r-xl text-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
        <button type="button" onClick={confirmar} disabled={enviando || !variante?.disponible} className={claseBotonMarca + " flex-1 disabled:opacity-60 sm:min-w-52 sm:flex-none"}>
          <ShoppingBag aria-hidden="true" /> {enviando ? "Agregando…" : "Agregar al carrito"}
        </button>
      </div>
      {agregado && (
        <p className="text-[13.5px] font-medium text-muted-foreground">
          Listo.{" "}
          <Link href="/carrito" className="font-bold text-brand-text hover:underline">
            Ver mi carrito
          </Link>
        </p>
      )}
    </div>
  )
}
