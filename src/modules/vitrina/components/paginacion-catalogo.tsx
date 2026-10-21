"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"

interface PaginacionCatalogoProps {
  paginaActual: number // 0-based desde la API
  totalPaginas: number
  total: number
  porPagina: number
  className?: string
}

export function PaginacionCatalogo({
  paginaActual,
  totalPaginas,
  total,
  porPagina,
  className,
}: PaginacionCatalogoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPaginas <= 1) return null

  const cambiarPagina = (nuevaPagina1Based: number) => {
    const params = new URLSearchParams(searchParams.toString())
    const nuevaPagina0Based = Math.max(0, nuevaPagina1Based - 1)

    if (nuevaPagina0Based > 0) {
      params.set("pagina", String(nuevaPagina0Based))
    } else {
      params.delete("pagina")
    }

    const query = params.toString() ? `?${params.toString()}` : ""
    router.push(`${pathname}${query}`)
  }

  return (
    <BarraPaginacion
      pagina={paginaActual + 1}
      totalPaginas={totalPaginas}
      total={total}
      porPagina={porPagina}
      etiqueta="productos"
      onCambiar={cambiarPagina}
      className={className}
    />
  )
}
