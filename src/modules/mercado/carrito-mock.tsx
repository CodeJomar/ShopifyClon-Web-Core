"use client"

import * as React from "react"
import type { ProductoMercado } from "@/dtos/mercado"

/**
 * Carrito global DE EJEMPLO (rediseño, semana 1): vive en el navegador y agrupa por tienda para poder recorrer el flujo mientras el
 * backend construye B4 (`/carrito`). Cuando exista, este proveedor se sustituye por llamadas a la API con la misma interfaz.
 */
export interface LineaCarrito {
  producto: ProductoMercado
  cantidad: number
}

interface ValorCarrito {
  lineas: LineaCarrito[]
  cantidadTotal: number
  /** Nunca es falso en servidor; sirve para no pintar el contador antes de leer el almacenamiento del navegador. */
  listo: boolean
  agregar: (producto: ProductoMercado, cantidad?: number) => void
  cambiarCantidad: (productoId: string, cantidad: number) => void
  quitar: (productoId: string) => void
  vaciar: () => void
}

const CLAVE = "otemu-carrito-ejemplo"
const Contexto = React.createContext<ValorCarrito | null>(null)

function leer(): LineaCarrito[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as LineaCarrito[]) : []
  } catch {
    return []
  }
}

export function CarritoEjemploProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = React.useState<LineaCarrito[]>([])
  const [listo, setListo] = React.useState(false)

  React.useEffect(() => {
    // Se lee una sola vez al montar: el navegador es la única fuente de este carrito de ejemplo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLineas(leer())
    setListo(true)
  }, [])

  const guardar = React.useCallback((siguiente: LineaCarrito[]) => {
    setLineas(siguiente)
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente))
    } catch {
      // Sin almacenamiento (modo privado): el carrito dura mientras la pestaña esté abierta.
    }
  }, [])

  const valor = React.useMemo<ValorCarrito>(
    () => ({
      lineas,
      listo,
      cantidadTotal: lineas.reduce((s, l) => s + l.cantidad, 0),
      agregar: (producto, cantidad = 1) => {
        const actual = leer()
        const existente = actual.find((l) => l.producto.id === producto.id)
        guardar(existente ? actual.map((l) => (l === existente ? { ...l, cantidad: Math.min(l.cantidad + cantidad, 20) } : l)) : [...actual, { producto, cantidad }])
      },
      cambiarCantidad: (id, cantidad) => guardar(leer().map((l) => (l.producto.id === id ? { ...l, cantidad: Math.min(Math.max(1, cantidad), 20) } : l))),
      quitar: (id) => guardar(leer().filter((l) => l.producto.id !== id)),
      vaciar: () => guardar([]),
    }),
    [lineas, listo, guardar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useCarritoEjemplo(): ValorCarrito {
  const valor = React.useContext(Contexto)
  if (!valor) throw new Error("useCarritoEjemplo debe usarse dentro de CarritoEjemploProvider")
  return valor
}

/** Agrupa las líneas por tienda, que es como las muestra y las cobra la plataforma. */
export function agruparPorTienda(lineas: LineaCarrito[]) {
  const grupos = new Map<string, { tienda: ProductoMercado["tienda"]; lineas: LineaCarrito[]; subtotal: number }>()
  for (const l of lineas) {
    const g = grupos.get(l.producto.tienda.subdominio) ?? { tienda: l.producto.tienda, lineas: [], subtotal: 0 }
    g.lineas.push(l)
    g.subtotal += l.producto.precio_desde * l.cantidad
    grupos.set(l.producto.tienda.subdominio, g)
  }
  return [...grupos.values()]
}
