import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"

import type { ProductoResumenVitrina } from "@/dtos/vitrina"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { formatearDinero } from "@/shared/utils/dinero"

interface TarjetaProductoProps {
  producto: ProductoResumenVitrina
  subdominio: string
  moneda?: string
}

export function TarjetaProducto({ producto, subdominio, moneda = "PEN" }: TarjetaProductoProps) {
  const tieneComparacion =
    producto.precio_comparacion !== undefined &&
    producto.precio_comparacion !== null &&
    producto.precio_comparacion !== ""

  return (
    <Link
      href={`/tienda/${subdominio}/productos/${producto.identificador_url}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl transition-transform hover:-translate-y-0.5"
    >
      <Card className="h-full overflow-hidden border-border transition-colors hover:border-brand-strong/40">
        <div className="relative aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
          {producto.imagen_principal ? (
            <Image
              src={producto.imagen_principal}
              alt={producto.titulo}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <Package className="size-12 text-muted-foreground/40" aria-hidden="true" />
          )}

          {!producto.disponible && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="font-bold text-[11px]">
                Agotado
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex flex-col gap-1.5">
          <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-brand-text transition-colors">
            {producto.titulo}
          </h3>

          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-xs text-muted-foreground font-medium">desde</span>
            <span className="text-sm font-extrabold text-foreground">
              {formatearDinero(producto.precio_minimo, moneda)}
            </span>
            {tieneComparacion && (
              <span className="text-xs text-muted-foreground line-through">
                {formatearDinero(producto.precio_comparacion, moneda)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
