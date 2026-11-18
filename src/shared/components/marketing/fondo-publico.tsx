"use client"

import { usePathname } from "next/navigation"
import { FondoAurora } from "./fondo-aurora"

/**
 * Fondo de aurora fijo para todas las pantallas de la persona que compra (portada, mercado, carrito, cuenta…). En la portada brilla al
 * máximo; en el resto baja de intensidad para que formularios y listas se lean con comodidad.
 */
export function FondoPublico() {
  const ruta = usePathname()
  return <FondoAurora className="!fixed inset-0 z-0" intensidad={ruta === "/" ? 1 : 0.5} />
}
