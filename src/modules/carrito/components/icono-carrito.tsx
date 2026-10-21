"use client"

import * as React from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { buttonVariants } from "@/shared/components/ui/button"
import { obtenerCarritoAction, CAMBIO_CARRITO } from "../actions/carrito.actions"

/** Acceso al carrito del encabezado: lleva a la página del carrito y muestra las unidades. */
export function IconoCarrito({ subdominio }: { subdominio: string }) {
  const [unidades, setUnidades] = React.useState(0)

  // Sin carrito (aún no creado) el icono simplemente muestra 0.
  const leerUnidades = React.useCallback(
    () =>
      obtenerCarritoAction(subdominio).then((res) =>
        setUnidades(res.ok ? res.datos.items.reduce((suma, l) => suma + l.cantidad, 0) : 0),
      ),
    [subdominio],
  )

  React.useEffect(() => {
    let cancelado = false
    obtenerCarritoAction(subdominio).then((res) => {
      if (cancelado) return
      setUnidades(res.ok ? res.datos.items.reduce((suma, l) => suma + l.cantidad, 0) : 0)
    })
    const alCambiar = (e: Event) => {
      if ((e as CustomEvent<{ subdominio: string }>).detail?.subdominio === subdominio) void leerUnidades()
    }
    window.addEventListener(CAMBIO_CARRITO, alCambiar)
    return () => {
      cancelado = true
      window.removeEventListener(CAMBIO_CARRITO, alCambiar)
    }
  }, [leerUnidades, subdominio])

  return (
    <Link
      href={`/tienda/${subdominio}/carrito`}
      className={`${buttonVariants({ variant: "ghost", size: "icon-sm" })} relative`}
      aria-label={`Carrito de compras, ${unidades} unidades`}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {unidades > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[11px] font-bold leading-5 text-primary-foreground">
          {unidades}
        </span>
      )}
    </Link>
  )
}
