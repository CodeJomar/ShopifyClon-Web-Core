"use client"

import * as React from "react"

import {
  Panel,
  PanelBody,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@/shared/components/ui/panel"

interface FormPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Contenido del formulario o detalle (lo aporta el módulo). */
  children: React.ReactNode
  /** Acciones del pie (guardar, cancelar...). */
  footer?: React.ReactNode
  /** Ajuste del pie cuando el estándar (dos botones lado a lado) no sirve, p. ej. botones apilados. */
  footerClassName?: string
  /** Ajuste del cuerpo; p. ej. quitarle el scroll para que solo una parte interna lo tenga. */
  bodyClassName?: string
}

/**
 * Contenedor estándar para crear, editar y ver detalles: panel flotante a la derecha con fondo desenfocado.
 * Solo es el armazón; el formulario y su lógica pertenecen al módulo que lo usa.
 */
export function FormPanel({ open, onOpenChange, title, description, children, footer, footerClassName, bodyClassName }: FormPanelProps) {
  return (
    <Panel open={open} onOpenChange={onOpenChange}>
      <PanelContent>
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
          {description && <PanelDescription>{description}</PanelDescription>}
        </PanelHeader>
        <PanelBody className={bodyClassName}>{children}</PanelBody>
        {footer && <PanelFooter className={footerClassName}>{footer}</PanelFooter>}
      </PanelContent>
    </Panel>
  )
}
