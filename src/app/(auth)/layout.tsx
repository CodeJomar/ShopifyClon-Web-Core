import * as React from "react"
import { BarChart3, Package, ReceiptText, Store, Ticket } from "lucide-react"

const VENTAJAS = [
  { icono: Package, titulo: "Catálogo e inventario", texto: "Productos, variantes y stock siempre al día." },
  { icono: ReceiptText, titulo: "Órdenes y envíos", texto: "Del pago a la entrega, paso a paso." },
  { icono: Ticket, titulo: "Cupones y promociones", texto: "Descuentos para tus campañas en redes." },
  { icono: BarChart3, titulo: "Métricas claras", texto: "Mira cómo van tus ventas cada día." },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-12 overflow-hidden bg-background">
      {/* Sección izquierda: 8 columnas. Panel de marca con tokens (sin fotos, W-002). */}
      <aside className="relative hidden h-full overflow-hidden bg-primary/14 lg:col-span-8 lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 right-0 size-[28rem] rounded-full bg-info/12 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-isla">
            <Store className="size-6" aria-hidden="true" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">OTemu</span>
        </div>

        <div className="relative max-w-xl space-y-8">
          <div className="space-y-3">
            <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">Crea tu tienda en minutos y véndela por redes.</h2>
            <p className="text-lg font-medium text-muted-foreground">Todo lo que necesitas para empezar a vender, en un solo lugar.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {VENTAJAS.map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="flex items-start gap-3 rounded-2xl bg-card/70 p-4 shadow-isla backdrop-blur-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
                  <Icono className="size-5" />
                </span>
                <span>
                  <span className="block text-[14px] font-extrabold text-foreground">{titulo}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Sección derecha: 4 columnas (formulario) */}
      {/* El formulario va sobre el lienzo: la etiqueta flotante corta el borde con el color del lienzo, no el de la isla. */}
      <div className="col-span-12 flex flex-col items-center justify-center gap-8 p-8 [--campo-exterior:var(--background)] sm:p-12 lg:col-span-4">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">OTemu</span>
        </div>
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
