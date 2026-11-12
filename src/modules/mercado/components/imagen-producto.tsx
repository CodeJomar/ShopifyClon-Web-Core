"use client"

import * as React from "react"
import type { CSSProperties } from "react"
import { Coffee, Headphones, House, Palette, Shirt, Sparkles, type LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils/cn"
export type IconoCategoria = "cafe" | "hogar" | "moda" | "tecnologia" | "belleza" | "arte"

const ICONOS: Record<IconoCategoria, LucideIcon> = {
  cafe: Coffee,
  hogar: House,
  moda: Shirt,
  tecnologia: Headphones,
  belleza: Sparkles,
  arte: Palette,
}

/**
 * Imagen de producto mientras no hay fotos reales: un degradado con el matiz de la tienda y el ícono de la categoría.
 * Con una foto (`src`) se muestra la foto. El matiz llega como variable CSS para no escribir colores en el componente.
 */
export function ImagenProducto({
  tono,
  icono = "arte",
  titulo,
  src,
  className,
}: {
  tono: number
  icono?: IconoCategoria
  titulo: string
  src?: string | null
  className?: string
}) {
  const Icono = ICONOS[icono]
  const [fallo, setFallo] = React.useState<string | null>(null)
  const [cargada, setCargada] = React.useState<string | null>(null)
  // Un servidor de imágenes que no responde no dispara `onError`: tras unos segundos sin carga se muestra la imagen generada.
  React.useEffect(() => {
    if (!src || cargada === src) return
    const t = setTimeout(() => setFallo(src), 6000)
    return () => clearTimeout(t)
  }, [src, cargada])
  if (src && fallo !== src) {
    // eslint-disable-next-line @next/next/no-img-element -- imágenes de tiendas externas, tamaño libre
    return <img src={src} alt={titulo} loading="lazy" onLoad={() => setCargada(src)} onError={() => setFallo(src)} className={cn("size-full object-cover", className)} />
  }
  return (
    <div
      role="img"
      aria-label={titulo}
      style={{ "--t": tono } as CSSProperties}
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden",
        "bg-[linear-gradient(140deg,hsl(var(--t)_88%_90%),hsl(calc(var(--t)+38)_78%_80%))]",
        "dark:bg-[linear-gradient(140deg,hsl(var(--t)_42%_20%),hsl(calc(var(--t)+38)_46%_13%))]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -right-6 -top-8 size-32 rounded-full bg-[hsl(var(--t)_90%_96%/0.7)] dark:bg-[hsl(var(--t)_60%_40%/0.25)]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-10 -left-8 size-36 rounded-full bg-[hsl(calc(var(--t)+60)_80%_74%/0.45)] dark:bg-[hsl(calc(var(--t)+60)_60%_36%/0.3)]"
      />
      <Icono
        aria-hidden="true"
        strokeWidth={1.5}
        className="relative size-1/3 min-h-9 min-w-9 text-[hsl(var(--t)_55%_28%)] dark:text-[hsl(var(--t)_80%_80%)]"
      />
    </div>
  )
}
