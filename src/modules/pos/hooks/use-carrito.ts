"use client"

import * as React from "react"
import { MAX_CANTIDAD_ITEM, calcularTotales, claveAgrupacion, tieneConfiguracion, type ItemCarrito, type ProductoPos, type SeleccionModificador, type TotalesCarrito } from "../schema"

/* -------------------------------------------------------------------------- */
/*                         Carrito con modificadores y totales                 */
/* -------------------------------------------------------------------------- */

export interface ConfiguracionItem {
  modificadores: SeleccionModificador[]
  notas?: string
}

export function useCarrito() {
  const [items, setItems] = React.useState<ItemCarrito[]>([])

  /** Agrega una unidad. Sin configuración se agrupa con la línea igual del mismo producto; con ella, va como línea propia. */
  const agregar = React.useCallback((producto: ProductoPos, configuracion?: ConfiguracionItem) => {
    if (!producto.disponible) return
    const configurado = configuracion ? tieneConfiguracion(configuracion) : false

    setItems((prev) => {
      if (!configurado) {
        const existente = prev.find((i) => claveAgrupacion(i.producto) === claveAgrupacion(producto) && !tieneConfiguracion(i))
        if (existente) {
          return prev.map((i) => (i.uid === existente.uid ? { ...i, cantidad: Math.min(i.cantidad + 1, MAX_CANTIDAD_ITEM) } : i))
        }
      }
      return [
        ...prev,
        {
          uid: crypto.randomUUID(),
          producto,
          cantidad: 1,
          modificadores: configuracion?.modificadores ?? [],
          notas: configuracion?.notas?.trim() || undefined,
        },
      ]
    })
  }, [])

  const cambiarCantidad = React.useCallback((uid: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.uid === uid ? { ...i, cantidad: Math.min(i.cantidad + delta, MAX_CANTIDAD_ITEM) } : i))
        .filter((i) => i.cantidad > 0),
    )
  }, [])

  const quitar = React.useCallback((uid: string) => setItems((prev) => prev.filter((i) => i.uid !== uid)), [])
  const vaciar = React.useCallback(() => setItems([]), [])

  const totales = React.useMemo<TotalesCarrito>(() => calcularTotales(items), [items])

  // Unidades de cada producto en el carrito (sumando sus variantes).
  const cantidades = React.useMemo(() => {
    const mapa = new Map<string, number>()
    for (const item of items) mapa.set(item.producto.id_producto, (mapa.get(item.producto.id_producto) ?? 0) + item.cantidad)
    return mapa
  }, [items])

  return { items, agregar, cambiarCantidad, quitar, vaciar, totales, cantidades }
}
