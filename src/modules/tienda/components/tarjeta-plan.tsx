"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import type { PlanDto } from "@/dtos/tienda"

interface TarjetaPlanProps {
  plan: PlanDto
  seleccionada: boolean
  /** Tarjeta que recibe el foco de tabulación dentro del grupo (la seleccionada). */
  enfoque: boolean
  onSeleccionar: () => void
  onTecla: (evento: React.KeyboardEvent<HTMLDivElement>) => void
  destacada?: boolean
}

/**
 * Tarjeta de plan seleccionable (patrón de W-006, dentro del módulo: no es un componente de `shared`).
 * Accesible: `role="radio"`, `aria-checked`, foco por teclado. Seleccionada: borde marca 1.8 y anillo marca al 18 %.
 * TODO(Q-W-006): el responsable revisa este diseño antes del merge.
 */
export const TarjetaPlan = React.forwardRef<HTMLDivElement, TarjetaPlanProps>(
  ({ plan, seleccionada, enfoque, onSeleccionar, onTecla, destacada }, ref) => (
    <Card
      ref={ref}
      role="radio"
      aria-checked={seleccionada}
      tabIndex={enfoque ? 0 : -1}
      onClick={onSeleccionar}
      onKeyDown={onTecla}
      data-seleccionada={seleccionada || undefined}
      className={cn(
        // Borde de 1.8 px siempre: al seleccionar cambia solo el color y el anillo (sin saltos de tamaño).
        "relative cursor-pointer gap-3 border-[1.8px] border-island-border p-5 transition-[border-color,box-shadow,transform] duration-200 outline-none",
        "hover:-translate-y-px hover:border-border-hover",
        "focus-visible:ring-[3.5px] focus-visible:ring-primary/18",
        seleccionada && "border-primary ring-[3.5px] ring-primary/18",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold text-foreground">{plan.nombre}</p>
          <p className="text-[12.5px] text-muted-foreground">{plan.descripcion}</p>
        </div>
        {destacada && <Badge variant="estado" tono="marca">Recomendado</Badge>}
        {seleccionada && (
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        )}
      </div>

      <p className="text-[22px] font-extrabold text-foreground">
        {formatearDinero(plan.precio_mensual, plan.moneda)}
        <span className="text-[12.5px] font-medium text-muted-foreground"> / mes</span>
      </p>

      <ul className="space-y-1 text-[12.5px] text-muted-foreground">
        <li>{plan.dias_prueba} días de prueba gratis</li>
        {plan.limite_productos == null ? (
          <li>Productos ilimitados</li>
        ) : (
          <li>Hasta {plan.limite_productos.toLocaleString("es-PE")} productos</li>
        )}
        {plan.limite_personal == null ? <li>Personas ilimitadas en el equipo</li> : <li>Hasta {plan.limite_personal} personas en el equipo</li>}
        <li>Comisión de {(plan.porcentaje_comision * 100).toLocaleString("es-PE", { maximumFractionDigits: 2 })} % por venta</li>
      </ul>
    </Card>
  ),
)
TarjetaPlan.displayName = "TarjetaPlan"
