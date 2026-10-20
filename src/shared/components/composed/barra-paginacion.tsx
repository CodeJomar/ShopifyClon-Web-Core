import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"

interface BarraPaginacionProps {
  /** Página actual, desde 1. */
  pagina: number
  totalPaginas: number
  /** Cantidad total de registros, para «Mostrando 1 – 8 de 38». */
  total: number
  /** Tamaño de página. */
  porPagina: number
  /** Nombre del contenido en plural: «productos», «órdenes». */
  etiqueta?: string
  onCambiar: (pagina: number) => void
  className?: string
}

/**
 * Paginación de listas (docs/diseno-web.md §4.6). En escritorio muestra el rango y los números de página;
 * en móvil (< 640 px) solo Anterior · «2 de 5» · Siguiente. Los datos vienen de la API: aquí solo se muestran.
 */
export function BarraPaginacion({ pagina, totalPaginas, total, porPagina, etiqueta = "registros", onCambiar, className }: BarraPaginacionProps) {
  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1
  const hasta = Math.min(pagina * porPagina, total)
  const primera = pagina <= 1
  const ultima = pagina >= totalPaginas

  return (
    <nav
      aria-label="Paginación"
      className={cn("flex items-center justify-between gap-3 border-t border-border/60 pt-3.5", className)}
    >
      <p className="hidden text-[12.5px] font-medium text-muted-foreground sm:block">
        Mostrando {desde} – {hasta} de {total} {etiqueta}
      </p>

      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Button variant="neutral" size="sm" className="rounded-[10px]" disabled={primera} onClick={() => onCambiar(pagina - 1)}>
          <ChevronLeft aria-hidden="true" />
          <span>Anterior</span>
        </Button>

        <div className="hidden items-center gap-1 sm:flex" aria-label="Páginas">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
            <Button
              key={numero}
              type="button"
              size="icon-sm"
              variant={numero === pagina ? "default" : "neutral"}
              className="rounded-[10px] text-xs"
              aria-current={numero === pagina ? "page" : undefined}
              onClick={() => onCambiar(numero)}
            >
              {numero}
            </Button>
          ))}
        </div>

        <p className="text-[12.5px] font-bold text-foreground sm:hidden">
          {pagina} de {totalPaginas}
        </p>

        <Button variant="neutral" size="sm" className="rounded-[10px]" disabled={ultima} onClick={() => onCambiar(pagina + 1)}>
          <span>Siguiente</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
