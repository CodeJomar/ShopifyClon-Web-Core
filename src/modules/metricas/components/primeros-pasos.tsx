"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Boxes, Link2, Package, Settings, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { PERMISO, type Puede } from "@/shared/constants/permisos"

interface PrimerosPasosProps {
  puede: Puede
  /** Copia el enlace de la tienda (la pantalla ya sabe cómo mostrar el aviso). */
  onCopiarEnlace: () => void
}

/** Guía para una tienda sin ventas: los pasos que la dejan lista para vender, solo los que el rol puede hacer. */
export function PrimerosPasos({ puede, onCopiarEnlace }: PrimerosPasosProps) {
  const pasos = [
    { id: "productos", icono: Package, titulo: "Agrega tu primer producto", texto: "Fotos, precio y stock en un solo lugar.", href: "/panel/productos", visible: puede(PERMISO.CATALOGO_GESTIONAR) },
    { id: "inventario", icono: Boxes, titulo: "Revisa tu inventario", texto: "Define cuántas unidades tienes de cada variante.", href: "/panel/inventario", visible: puede(PERMISO.INVENTARIO_AJUSTAR) },
    { id: "envios", icono: Truck, titulo: "Configura tus envíos", texto: "Zonas y tarifas para que tus clientes sepan el costo.", href: "/panel/envios", visible: puede(PERMISO.ENVIOS_CONFIGURAR) },
    { id: "configuracion", icono: Settings, titulo: "Completa los datos de tu tienda", texto: "Nombre, correo de contacto y moneda.", href: "/panel/configuracion", visible: puede(PERMISO.TIENDA_CONFIGURAR) },
  ].filter((paso) => paso.visible)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deja tu tienda lista para vender</CardTitle>
        <CardDescription>Aún no hay ventas. Estos pasos te llevan de cero a tu primera orden.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pasos.map((paso, indice) => (
            <li key={paso.id}>
              <Link
                href={paso.href}
                className="group flex h-full items-start gap-3.5 rounded-xl border border-border/60 bg-muted/40 p-4 outline-none transition-all hover:-translate-y-px hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
                  <paso.icono className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paso {indice + 1}</span>
                  <span className="mt-0.5 block text-[14px] font-extrabold text-foreground">{paso.titulo}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{paso.texto}</span>
                </span>
                <ArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text" />
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={onCopiarEnlace}
              className="group flex h-full w-full cursor-pointer items-start gap-3.5 rounded-xl border border-border/60 bg-muted/40 p-4 text-left outline-none transition-all hover:-translate-y-px hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
                <Link2 className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paso {pasos.length + 1}</span>
                <span className="mt-0.5 block text-[14px] font-extrabold text-foreground">Comparte tu enlace</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">Cópialo y publícalo en tus redes.</span>
              </span>
            </button>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
