import { RefreshCw, TriangleAlert } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty"

interface EstadoErrorProps {
  /** Mensaje que devolvió la API o texto genérico de la pantalla. */
  mensaje: string
  titulo?: string
  /** Si se envía, se muestra el botón «Reintentar». */
  onReintentar?: () => void
  className?: string
}

/** Estado de error de una sección o lista: explica qué falló y permite volver a intentar. */
export function EstadoError({ mensaje, titulo = "No se pudo cargar la información", onReintentar, className }: EstadoErrorProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        <EmptyDescription>{mensaje}</EmptyDescription>
      </EmptyHeader>
      {onReintentar && (
        <EmptyContent>
          <Button type="button" variant="outline" size="sm" onClick={onReintentar} leftIcon={<RefreshCw className="size-4" />} className="rounded-full">
            Reintentar
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
