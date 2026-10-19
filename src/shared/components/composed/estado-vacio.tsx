import { SearchX, type LucideIcon } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty"

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  icono?: LucideIcon
  /** Si se envía, se muestra un botón de acción (por ejemplo «Limpiar filtros»). */
  accion?: { texto: string; onClick: () => void }
  className?: string
}

/** Estado vacío de una lista: sin resultados o aún sin registros. */
export function EstadoVacio({ titulo, descripcion, icono: Icono = SearchX, accion, className }: EstadoVacioProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icono />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        {descripcion && <EmptyDescription>{descripcion}</EmptyDescription>}
      </EmptyHeader>
      {accion && (
        <EmptyContent>
          <Button type="button" variant="outline" size="sm" onClick={accion.onClick} className="rounded-full">
            {accion.texto}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
