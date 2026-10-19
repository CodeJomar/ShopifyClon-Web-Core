"use client"

import * as React from "react"
import { CircleCheck, HelpCircle, Info, TriangleAlert, type LucideIcon } from "lucide-react"
import type { VariantProps } from "class-variance-authority"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import type { buttonVariants } from "@/shared/components/ui/button"

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
export type ConfirmTone = "default" | "destructive" | "warning" | "success" | "info"

export interface ConfirmOptions {
  /** Preset de severidad: define ícono, color y botón de confirmar. Por defecto `default`. */
  variant?: ConfirmTone
  /** Sobrescribe el título (por defecto, texto genérico según el preset). */
  title?: string
  /** Sobrescribe la descripción (por defecto, texto genérico según el preset). */
  description?: string
  /** Sobrescribe el texto del botón de confirmar (por defecto "Sí, confirmar"). */
  confirmText?: string
  /** Sobrescribe el texto del botón de cancelar (por defecto "No, cancelar"). */
  cancelText?: string
  /** Sobrescribe el ícono del preset (cualquier ícono de lucide-react). */
  icon?: LucideIcon
  /** Clases para recolorear el círculo del ícono, p. ej. "bg-amber-50 text-amber-600 ring-amber-50/60". */
  iconClassName?: string
  /** Sobrescribe la variante del botón de confirmar. */
  confirmVariant?: ButtonVariant
  /** Sobrescribe la variante del botón de cancelar (por defecto `neutral`). */
  cancelVariant?: ButtonVariant
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<ConfirmFn | null>(null)

interface Preset {
  icon: LucideIcon
  iconClassName?: string
  confirmVariant: ButtonVariant
  title: string
  description: string
}

// Textos genéricos a propósito: la confirmación no nombra la acción ni el registro (eso lo da el contexto de
// la pantalla; el detalle específico va en el toast posterior). Cada pantalla puede sobrescribirlos si lo necesita.
const PRESETS: Record<ConfirmTone, Preset> = {
  default: {
    icon: HelpCircle,
    confirmVariant: "default",
    title: "¿Deseas continuar?",
    description: "Confirma para realizar esta acción.",
  },
  destructive: {
    icon: TriangleAlert,
    iconClassName: "bg-red-50 text-red-600 ring-red-50/60 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-950/30",
    confirmVariant: "danger-strong",
    title: "¿Estás seguro?",
    description: "Esta acción no se puede deshacer.",
  },
  warning: {
    icon: TriangleAlert,
    iconClassName: "bg-amber-50 text-amber-600 ring-amber-50/60 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-950/30",
    confirmVariant: "warning",
    title: "Atención",
    description: "Revisa la información antes de continuar.",
  },
  success: {
    icon: CircleCheck,
    iconClassName: "bg-green-50 text-green-600 ring-green-50/60 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-950/30",
    confirmVariant: "success",
    title: "¿Deseas confirmar?",
    description: "Confirma para completar esta acción.",
  },
  info: {
    icon: Info,
    iconClassName: "bg-cyan-50 text-cyan-600 ring-cyan-50/60 dark:bg-cyan-950/40 dark:text-cyan-400 dark:ring-cyan-950/30",
    confirmVariant: "info",
    title: "¿Deseas continuar?",
    description: "Confirma para realizar esta acción.",
  },
}

/**
 * Confirmación global (AlertDialog). Se monta UNA vez en el layout raíz y se usa desde cualquier pantalla:
 *
 *   const confirm = useConfirm()
 *   if (!(await confirm({ variant: "destructive" }))) return
 *
 * Todo es sobrescribible (ver ConfirmOptions) para los casos que lo requieran.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  // Las opciones se conservan al cerrar para que el contenido no parpadee durante la animación de salida.
  const [options, setOptions] = React.useState<ConfirmOptions>({})
  const resolverRef = React.useRef<((resultado: boolean) => void) | null>(null)

  const resolver = React.useCallback((resultado: boolean) => {
    resolverRef.current?.(resultado)
    resolverRef.current = null
    setOpen(false)
  }, [])

  const confirm = React.useCallback<ConfirmFn>((opciones = {}) => {
    // Si ya había una confirmación pendiente, se descarta como "cancelada".
    resolverRef.current?.(false)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setOptions(opciones)
      setOpen(true)
    })
  }, [])

  const preset = PRESETS[options.variant ?? "default"]
  const Icono = options.icon ?? preset.icon

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={(abierto) => !abierto && resolver(false)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className={options.iconClassName ?? preset.iconClassName}>
              <Icono strokeWidth={1.75} />
            </AlertDialogMedia>
            <AlertDialogTitle>{options.title ?? preset.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description ?? preset.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant={options.cancelVariant ?? "neutral"} size="sm" className="cursor-pointer">
              {options.cancelText ?? "No, cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={options.confirmVariant ?? preset.confirmVariant}
              size="sm"
              onClick={() => resolver(true)}
              className="cursor-pointer"
            >
              {options.confirmText ?? "Sí, confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const confirm = React.useContext(ConfirmContext)
  if (!confirm) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider> (montado en el layout raíz).")
  return confirm
}
