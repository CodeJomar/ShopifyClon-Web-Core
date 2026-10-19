"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string
  onValueChange: (valor: string) => void
  /** Tecla de atajo que se muestra como pista mientras no hay texto (por ejemplo "/"). El atajo en sí lo programa quien lo usa. */
  atajo?: string
}

/**
 * Buscador estándar con el mismo diseño que los demás campos (etiqueta flotante): lupa a la izquierda y botón para
 * limpiar a la derecha cuando hay texto. Controlado (`value` + `onValueChange`); el `placeholder` es la etiqueta.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onValueChange, placeholder = "Buscar…", className, atajo, ...props },
  ref,
) {
  return (
    <FloatingInput
      ref={ref}
      type="search"
      label={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      autoComplete="off"
      leftIcon={<Search className="size-4" />}
      rightIcon={
        value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Limpiar búsqueda"
            className="flex size-6 cursor-pointer items-center justify-center rounded-full"
          >
            <X className="size-3.5" />
          </button>
        ) : atajo ? (
          <kbd className="pointer-events-none hidden rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-semibold text-slate-500 sm:block dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {atajo}
          </kbd>
        ) : undefined
      }
      className={className}
      aria-label={props["aria-label"] ?? placeholder}
      {...props}
    />
  )
})
