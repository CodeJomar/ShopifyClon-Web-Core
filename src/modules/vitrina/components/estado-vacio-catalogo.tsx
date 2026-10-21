"use client"

import { useRouter } from "next/navigation"
import { SearchX } from "lucide-react"

import { EstadoVacio } from "@/shared/components/composed/estado-vacio"

interface EstadoVacioCatalogoProps {
  subdominio: string
  tieneFiltros?: boolean
}

export function EstadoVacioCatalogo({ subdominio, tieneFiltros = false }: EstadoVacioCatalogoProps) {
  const router = useRouter()

  return (
    <EstadoVacio
      titulo="No encontramos productos"
      descripcion={
        tieneFiltros
          ? "No hay productos que coincidan con los filtros aplicados. Intenta con otros términos o limpia los filtros."
          : "Esta tienda aún no tiene productos disponibles en su catálogo."
      }
      icono={SearchX}
      accion={
        tieneFiltros
          ? {
              texto: "Limpiar filtros",
              onClick: () => router.push(`/tienda/${encodeURIComponent(subdominio)}/productos`),
            }
          : undefined
      }
    />
  )
}
