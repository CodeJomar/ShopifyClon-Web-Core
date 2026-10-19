import { SearchX, type LucideIcon } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  icono?: LucideIcon
  /** Si se envía, se muestra un botón de acción (por ejemplo «Limpiar filtros»). */
  accion?: { texto: string; onClick: () => void }
  className?: string
}

/**
 * Estado vacío de una lista o de una pantalla: sin resultados o aún sin registros (docs/diseno-web.md §4.5).
 * Círculo de 64 px con la marca al 14 %, título 16/800 y descripción de 13 px.
 */
export function EstadoVacio({ titulo, descripcion, icono: Icono = SearchX, accion, className }: EstadoVacioProps) {
  return (
    <div
      data-slot="estado-vacio"
      className={cn("flex flex-col items-center justify-center gap-2 px-6 py-6 text-center", className)}
    >
      <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-brand-strong/14 text-brand-text">
        <Icono className="size-7" aria-hidden="true" />
      </div>
      <h3 className="text-base font-extrabold tracking-tight text-foreground">{titulo}</h3>
      {descripcion && <p className="max-w-xs text-[13px] text-muted-foreground">{descripcion}</p>}
      {accion && (
        <Button type="button" variant="soft" size="sm" onClick={accion.onClick} className="mt-2">
          {accion.texto}
        </Button>
      )}
    </div>
  )
}
