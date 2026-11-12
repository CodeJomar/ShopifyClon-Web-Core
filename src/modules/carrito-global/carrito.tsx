"use client"

import * as React from "react"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ErrorApi } from "@/lib/api/error-api"
import type { CarritoGlobalDto } from "@/dtos/carrito-global"

/**
 * Carrito global (B4): lo guarda la API y el proxy mantiene su token en una cookie httpOnly, así que el navegador nunca lo ve.
 * Un solo carrito reúne productos de varias tiendas, siempre en la misma moneda (CAR-009).
 */
interface ValorCarrito {
  carrito: CarritoGlobalDto | null
  /** Falso hasta la primera lectura: evita pintar «carrito vacío» antes de saber. */
  listo: boolean
  cantidadTotal: number
  agregar: (varianteId: string, cantidad?: number) => Promise<ErrorApi | null>
  cambiarCantidad: (varianteId: string, cantidad: number) => Promise<ErrorApi | null>
  quitar: (varianteId: string) => Promise<ErrorApi | null>
  vaciar: () => Promise<void>
  recargar: () => Promise<void>
  /** Sustituye el carrito con una respuesta ya recibida (por ejemplo, la cotización con envíos). */
  reemplazar: (carrito: CarritoGlobalDto | null) => void
}

const Contexto = React.createContext<ValorCarrito | null>(null)
const llamar = <T,>(configuracion: Parameters<typeof peticionApi<T>>[0]) => resultado(peticionApi<T>({ ...configuracion, sinRedireccion401: true }))

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [carrito, setCarrito] = React.useState<CarritoGlobalDto | null>(null)
  const [listo, setListo] = React.useState(false)

  const recargar = React.useCallback(async () => {
    const res = await llamar<CarritoGlobalDto>({ method: "GET", url: "/carrito" })
    // Sin carrito todavía (404 CAR-404) o vencido: se muestra vacío.
    setCarrito(res.ok && res.datos.cantidad_articulos > 0 ? res.datos : null)
    setListo(true)
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura inicial del carrito en la API
    void recargar()
  }, [recargar])

  const aplicar = React.useCallback(async (promesa: ReturnType<typeof llamar<CarritoGlobalDto>>): Promise<ErrorApi | null> => {
    const res = await promesa
    if (!res.ok) return res.error
    setCarrito(res.datos.cantidad_articulos > 0 ? res.datos : null)
    return null
  }, [])

  const valor = React.useMemo<ValorCarrito>(
    () => ({
      carrito,
      listo,
      cantidadTotal: carrito?.cantidad_articulos ?? 0,
      agregar: (varianteId, cantidad = 1) => aplicar(llamar<CarritoGlobalDto>({ method: "POST", url: "/carrito/items", data: { variante_id: varianteId, cantidad } })),
      cambiarCantidad: (varianteId, cantidad) =>
        aplicar(llamar<CarritoGlobalDto>({ method: "PUT", url: `/carrito/items/${encodeURIComponent(varianteId)}`, data: { cantidad } })),
      quitar: (varianteId) => aplicar(llamar<CarritoGlobalDto>({ method: "DELETE", url: `/carrito/items/${encodeURIComponent(varianteId)}` })),
      vaciar: async () => {
        for (const linea of carrito?.tiendas.flatMap((t) => t.lineas) ?? []) {
          await llamar<CarritoGlobalDto>({ method: "DELETE", url: `/carrito/items/${encodeURIComponent(linea.variante_id)}` })
        }
        await recargar()
      },
      recargar,
      reemplazar: setCarrito,
    }),
    [carrito, listo, aplicar, recargar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useCarrito(): ValorCarrito {
  const valor = React.useContext(Contexto)
  if (!valor) throw new Error("useCarrito debe usarse dentro de CarritoProvider")
  return valor
}
