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
  /** La métrica principal de la pantalla: fondo y borde de marca. */
  destacada?: boolean
  className?: string
}

/** Tarjeta de métrica del dashboard: ícono en baldosa, monto 24/800 y ayuda de 12 px. */
export function TarjetaMetrica({ titulo, valor, ayuda, icono, destacada = false, className }: TarjetaMetricaProps) {
  return (
    <Card className={cn("h-full", destacada && "border-primary/40 bg-primary/8", className)}>
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          {icono && (
            <span
              className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", destacada ? "bg-primary text-primary-foreground" : "bg-primary/14 text-brand-text")}
              aria-hidden="true"
            >
              {icono}
            </span>
          )}
          <p className="text-[12.5px] font-semibold text-muted-foreground">{titulo}</p>
        </div>
        <p className="text-[24px] font-extrabold leading-none tracking-tight text-foreground">{valor}</p>
        {ayuda && <p className="mt-auto text-[12px] text-muted-foreground">{ayuda}</p>}
      </CardContent>
    </Card>
  )
}
