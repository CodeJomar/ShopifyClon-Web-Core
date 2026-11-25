"use client"

import { usePathname } from "next/navigation"
import { FondoAurora } from "./fondo-aurora"

/**
 * Fondo de aurora fijo, solo para la portada. El resto del sitio (mercado, carrito, cuenta…) va sobre el fondo liso; la otra
 * única aparición de la aurora es el panel izquierdo de la pantalla de acceso.
 */
export function FondoPublico() {
  const ruta = usePathname()
  if (ruta !== "/") return null
  return <FondoAurora className="!fixed inset-0 z-0" intensidad={1} />
}
