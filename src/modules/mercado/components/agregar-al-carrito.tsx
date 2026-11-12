"use client"

import * as React from "react"
import Link from "next/link"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { toast } from "@/shared/components/ui/toast"
import { claseBotonMarca } from "@/shared/components/marketing/estilos"
import { useCarritoEjemplo } from "../carrito-mock"
import type { ProductoMercado } from "@/dtos/mercado"

/** Selector de cantidad y botón «Agregar al carrito» del detalle de producto. */
export function AgregarAlCarrito({ producto }: { producto: ProductoMercado }) {
  const { agregar } = useCarritoEjemplo()
  const [cantidad, setCantidad] = React.useState(1)
  const [agregado, setAgregado] = React.useState(false)

  const confirmar = () => {
    agregar(producto, cantidad)
    setAgregado(true)
    toast.add({ type: "success", title: "Agregado al carrito", description: `${cantidad} × ${producto.titulo}` })
  }

  if (!producto.disponible) {
    return <p className="rounded-xl bg-secondary px-4 py-3 text-[14px] font-semibold text-muted-foreground">Este producto está agotado por ahora.</p>
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
        <button type="button" onClick={confirmar} className={claseBotonMarca + " flex-1 sm:flex-none sm:min-w-52"}>
          <ShoppingBag aria-hidden="true" /> Agregar al carrito
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
