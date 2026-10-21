import * as React from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/utils/cn"

interface TarjetaMetricaProps {
  titulo: string
  /** Monto ya formateado con la moneda de la tienda. */
  valor: string
  /** Texto de apoyo debajo del monto (rango, aclaración). */
  ayuda?: string
  icono?: React.ReactNode
  className?: string
}

/**
 * Tarjeta de métrica del inicio del panel (patrón nuevo de W-007, dentro del módulo): título 12.5 / 600 en
 * `--muted-foreground`, monto 22 / 800, ayuda de 12 px. Pendiente de la revisión de diseño del responsable.
 */
export function TarjetaMetrica({ titulo, valor, ayuda, icono, className }: TarjetaMetricaProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12.5px] font-semibold text-muted-foreground">{titulo}</p>
          {icono && <span className="text-brand-text" aria-hidden="true">{icono}</span>}
        </div>
        <p className="text-[22px] font-extrabold tracking-tight text-foreground">{valor}</p>
        {ayuda && <p className="text-[12px] text-muted-foreground">{ayuda}</p>}
      </CardContent>
    </Card>
  )
}
