"use client"

import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"

export interface OpcionFiltro {
  value: string
  label: string
}

interface FiltroSelectProps {
  label: string
  value: string
  onValueChange: (valor: string) => void
  opciones: OpcionFiltro[]
  disabled?: boolean
  className?: string
}

/** Selector de filtros con etiqueta flotante (mismo diseño que los demás campos); muestra la etiqueta de la opción elegida. */
export function FiltroSelect({ label, value, onValueChange, opciones, disabled, className }: FiltroSelectProps) {
  return (
    <div className={className}>
      <FloatingSelect
        label={label}
        value={value}
        onValueChange={(valor) => onValueChange(String(valor ?? ""))}
        items={opciones}
        disabled={disabled}
      >
        <SelectContent>
          {opciones.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </FloatingSelect>
    </div>
  )
}
