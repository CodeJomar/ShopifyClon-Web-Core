"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, ShoppingBag } from "lucide-react"

import type { ImagenVitrina, ProductoDetalleVitrina, VarianteVitrina } from "@/dtos/vitrina"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatearDinero } from "@/shared/utils/dinero"

interface DetalleProductoInteractivoProps {
  producto: ProductoDetalleVitrina
  subdominio: string
  moneda?: string
}

export function DetalleProductoInteractivo({
  producto,
  subdominio,
  moneda = "PEN",
}: DetalleProductoInteractivoProps) {
  // Ordenar imágenes por posición
  const imagenesOrdenadas = React.useMemo(() => {
    return [...producto.imagenes].sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))
  }, [producto.imagenes])

  // Variante seleccionada por defecto: la primera disponible o la primera de la lista
  const [varianteSeleccionada, setVarianteSeleccionada] = React.useState<VarianteVitrina>(() => {
    return producto.variantes.find((v) => v.disponible) ?? producto.variantes[0]
  })

  // Imagen activa: busca la asociada a la variante o la primera imagen
  const [imagenActiva, setImagenActiva] = React.useState<ImagenVitrina | null>(() => {
    if (varianteSeleccionada?.id) {
      const imgVar = imagenesOrdenadas.find((img) => img.variante_id === varianteSeleccionada.id)
      if (imgVar) return imgVar
    }
    return imagenesOrdenadas[0] ?? null
  })

  const seleccionarVariante = (variante: VarianteVitrina) => {
    setVarianteSeleccionada(variante)
    // Si la variante tiene imagen asociada, cambiar a ella
    if (variante.id) {
      const imgVariante = imagenesOrdenadas.find((img) => img.variante_id === variante.id)
      if (imgVariante) {
        setImagenActiva(imgVariante)
      }
    }
  }

  const tieneComparacion =
    varianteSeleccionada?.precio_comparacion !== undefined &&
    varianteSeleccionada?.precio_comparacion !== null &&
    varianteSeleccionada?.precio_comparacion !== ""

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      {/* Galería de imágenes */}
      <div className="flex flex-col gap-4">
        {/* Imagen principal */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
          {imagenActiva?.url_imagen ? (
            <Image
              src={imagenActiva.url_imagen}
              alt={imagenActiva.texto_alternativo || producto.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <Package className="size-20 text-muted-foreground/30" aria-hidden="true" />
          )}

          {!varianteSeleccionada?.disponible && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="font-bold text-xs px-2.5 py-1">
                Agotado
              </Badge>
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {imagenesOrdenadas.length > 1 && (
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Miniaturas de imágenes">
            {imagenesOrdenadas.map((img, i) => {
              const esActiva = imagenActiva?.url_imagen === img.url_imagen
              return (
                <button
                  key={`${img.url_imagen}-${i}`}
                  type="button"
                  onClick={() => setImagenActiva(img)}
                  className={`relative size-16 overflow-hidden rounded-lg border transition-all ${
                    esActiva
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-brand-strong/40"
                  }`}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <Image
                    src={img.url_imagen}
                    alt={img.texto_alternativo || `${producto.titulo} miniatura ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Información del producto y compra */}
      <div className="flex flex-col gap-6">
        {/* Categorías */}
        {producto.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {producto.categorias.map((cat) => (
              <Link
                key={cat.identificador_url}
                href={`/tienda/${subdominio}/productos?categoria=${cat.identificador_url}`}
              >
                <Badge variant="outline" className="text-xs hover:border-brand-strong/60 transition-colors">
                  {cat.nombre}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Título */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {producto.titulo}
          </h1>
        </div>

        {/* Precio */}
        <div className="flex items-baseline gap-3 border-y border-border/60 py-3">
          <span className="text-2xl font-extrabold text-foreground sm:text-3xl">
            {formatearDinero(varianteSeleccionada?.precio, moneda)}
          </span>
          {tieneComparacion && (
            <span className="text-base text-muted-foreground line-through">
              {formatearDinero(varianteSeleccionada?.precio_comparacion, moneda)}
            </span>
          )}
          {varianteSeleccionada?.disponible ? (
            <Badge variant="secondary" className="ml-auto text-xs">
              Disponible
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-auto text-xs">
              Agotado
            </Badge>
          )}
        </div>

        {/* Selector de variantes (solo si hay más de una) */}
        {producto.variantes.length > 1 && (
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Variante: <span className="text-foreground">{varianteSeleccionada?.titulo}</span>
            </label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variantes de producto">
              {producto.variantes.map((v) => {
                const seleccionada = varianteSeleccionada?.id === v.id
                return (
                  <Button
                    key={v.id}
                    type="button"
                    variant={seleccionada ? "default" : "neutral"}
                    size="sm"
                    disabled={!v.disponible}
                    onClick={() => seleccionarVariante(v)}
                    className="rounded-lg text-xs"
                    aria-checked={seleccionada}
                    role="radio"
                  >
                    {v.titulo}
                    {!v.disponible && " (Agotado)"}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Botón de compra (desactivado en W-014; lo conecta W-015) */}
        <div className="pt-2">
          {/* TODO(W-015): Conectar con el carrito de compras */}
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled
            className="w-full gap-2 text-sm font-bold opacity-60"
            title="Agregar al carrito estará disponible próximamente"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span>Agregar al carrito</span>
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            El carrito de compras se habilitará en la siguiente fase.
          </p>
        </div>

        {/* Descripción */}
        {producto.descripcion && (
          <div className="border-t border-border/60 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Descripción
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line text-[13.5px] leading-relaxed">
              {producto.descripcion}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
