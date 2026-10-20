"use client"

import * as React from "react"
import { Dialog as PanelPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/shared/utils/cn"

/**
 * Panel lateral flotante para formularios (crear, editar, ver detalle).
 * Componente propio: no reemplaza a `Sheet` (usado por el sidebar) ni a `Dialog` (usado por el command palette).
 * Estética del sidebar compacto en tablet: separado de los bordes, esquinas muy redondeadas, sombra marcada,
 * fondo oscuro con desenfoque y deslizamiento de 300 ms.
 */

function Panel({ ...props }: PanelPrimitive.Root.Props) {
  return <PanelPrimitive.Root data-slot="panel" {...props} />
}

function PanelTrigger({ ...props }: PanelPrimitive.Trigger.Props) {
  return <PanelPrimitive.Trigger data-slot="panel-trigger" {...props} />
}

function PanelClose({ ...props }: PanelPrimitive.Close.Props) {
  return <PanelPrimitive.Close data-slot="panel-close" {...props} />
}

function PanelPortal({ ...props }: PanelPrimitive.Portal.Props) {
  return <PanelPrimitive.Portal data-slot="panel-portal" {...props} />
}

function PanelOverlay({ className, ...props }: PanelPrimitive.Backdrop.Props) {
  return (
    <PanelPrimitive.Backdrop
      data-slot="panel-overlay"
      className={cn(
        "fixed inset-0 z-[90] bg-black/50 backdrop-blur-xs transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/70",
        className
      )}
      {...props}
    />
  )
}

function PanelContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: PanelPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <PanelPortal>
      <PanelOverlay />
      <PanelPrimitive.Popup
        data-slot="panel-content"
        className={cn(
          "fixed inset-y-2 right-2 z-[95] flex w-[calc(100%-1rem)] flex-col overflow-hidden rounded-3xl border border-island-border bg-card shadow-isla text-sm text-foreground shadow-2xl outline-none transition-transform duration-300 ease-in-out sm:max-w-md",
          "data-ending-style:translate-x-[120%] data-starting-style:translate-x-[120%]",
          "  ",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <PanelPrimitive.Close
            data-slot="panel-close"
            aria-label="Cerrar panel"
            className="absolute top-4 right-4 flex size-9 cursor-pointer items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-brand-strong/12 hover:text-brand-text focus-visible:ring-2 focus-visible:ring-ring   "
          >
            <XIcon className="size-5" />
          </PanelPrimitive.Close>
        )}
      </PanelPrimitive.Popup>
    </PanelPortal>
  )
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn("flex flex-col gap-1 border-b border-brand-strong px-6 py-5 pr-16 ", className)}
      {...props}
    />
  )
}

/** Zona central desplazable (el formulario o el detalle). */
function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-body" className={cn("no-scrollbar flex-1 overflow-y-auto px-6 py-5", className)} {...props} />
}

function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-footer"
      className={cn(
        // Estándar de acciones: abajo; dos botones centrados y del mismo tamaño, uno solo pegado a la derecha.
        // La acción principal va en el color del negocio y «Cancelar/Volver» en la variante neutral.
        "mt-auto flex flex-col-reverse gap-3 border-t border-brand-strong px-6 py-4  [&>*]:w-full sm:flex-row sm:justify-end sm:has-[>:nth-child(2)]:justify-center sm:[&>*]:w-44",
        className
      )}
      {...props}
    />
  )
}

function PanelTitle({ className, ...props }: PanelPrimitive.Title.Props) {
  return (
    <PanelPrimitive.Title
      data-slot="panel-title"
      className={cn("font-extrabold text-lg font-semibold text-foreground ", className)}
      {...props}
    />
  )
}

function PanelDescription({ className, ...props }: PanelPrimitive.Description.Props) {
  return (
    <PanelPrimitive.Description
      data-slot="panel-description"
      className={cn("text-xs leading-relaxed text-muted-foreground ", className)}
      {...props}
    />
  )
}

export {
  Panel,
  PanelTrigger,
  PanelClose,
  PanelContent,
  PanelHeader,
  PanelBody,
  PanelFooter,
  PanelTitle,
  PanelDescription,
}
