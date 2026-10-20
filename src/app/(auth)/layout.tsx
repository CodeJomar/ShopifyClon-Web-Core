import * as React from "react"
import { Store } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-12 overflow-hidden bg-background">
      {/* Sección izquierda: 8 columnas. Panel de marca con tokens (sin fotos, W-002). */}
      <aside className="relative hidden h-full overflow-hidden bg-primary/14 lg:col-span-8 lg:flex lg:flex-col lg:justify-end lg:p-16">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-lg">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-isla">
            <Store className="size-7" aria-hidden="true" />
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-foreground">OTemu</p>
          <p className="mt-3 text-lg font-medium text-muted-foreground">
            Crea tu tienda en minutos y véndela por redes.
          </p>
        </div>
      </aside>

      {/* Sección derecha: 4 columnas (formulario) */}
      <div className="col-span-12 flex items-center justify-center p-8 sm:p-12 lg:col-span-4">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
