"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { ThemeToggle } from "@/shared/components/theme/theme-toggle"

export interface ErrorLayoutProps {
  codigo: number
  titulo: string
  descripcion: string
  ilustracion: React.ReactNode
  /** Pantalla a la que lleva el botón principal. */
  rutaInicio?: string
  /** Si se envía, aparece el botón «Reintentar». */
  onReintentar?: () => void
  /** Dentro del workspace: ocupa el espacio del contenido en vez de toda la ventana. */
  embebido?: boolean
}

/**
 * Distribución de las pantallas de error: ilustración a la izquierda; a la derecha el código, el título como
 * protagonista, la descripción y las acciones (volver al inicio y, si aplica, reintentar).
 */
export function ErrorLayout({ codigo, titulo, descripcion, ilustracion, rutaInicio = "/", onReintentar, embebido = false }: ErrorLayoutProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-brand-strong/12 text-foreground transition-colors  dark:text-white",
        embebido ? "h-full min-h-0 rounded-2xl p-4 md:p-8" : "min-h-screen p-6 md:p-12 lg:p-16"
      )}
    >
      {!embebido && (
        <div className="absolute right-5 top-5 z-20 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
      )}
      {/* Iluminación cálida muy sutil */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-warning/4 blur-[140px] dark:bg-warning/6" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[140px] dark:bg-primary/12" />
      </div>

      <main
        className={cn(
          "relative z-10 mx-auto grid w-full grid-cols-12 items-center gap-8 md:gap-12",
          embebido ? "max-w-4xl" : "max-w-5xl lg:max-w-6xl lg:gap-16"
        )}
      >
        <div className="col-span-12 flex items-center justify-center md:col-span-6">
          <div
            className={cn(
              "w-full drop-shadow-xl transition-transform duration-500 hover:scale-[1.02]",
              embebido ? "max-w-[260px] md:max-w-[340px]" : "max-w-[320px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[480px]"
            )}
          >
            {ilustracion}
          </div>
        </div>

        <div className="col-span-12 flex flex-col items-start justify-center text-left md:col-span-6 md:pl-4 lg:pl-8">
          <div className="mb-6 flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground md:text-base ">Error {codigo}</span>
            <div className="mt-2 h-[2px] w-8 bg-foreground dark:bg-card" />
          </div>

          <h1
            className={cn(
              "mb-5 font-bold leading-[1.08] tracking-tight text-foreground dark:text-white",
              embebido ? "text-3xl sm:text-4xl lg:text-5xl" : "text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem]"
            )}
          >
            {titulo}
          </h1>

          <p className="mb-8 max-w-md text-base font-normal leading-relaxed text-foreground sm:text-lg ">{descripcion}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => router.push(rutaInicio)}>
              Volver al inicio
            </Button>
            {onReintentar && (
              <Button variant="outline" size="lg" onClick={onReintentar}>
                Reintentar
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
