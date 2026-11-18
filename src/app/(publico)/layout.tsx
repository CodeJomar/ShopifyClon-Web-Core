import { CabeceraPublica } from "@/shared/components/marketing/cabecera-publica"
import { PiePublico } from "@/shared/components/marketing/pie-publico"
import { CarritoProvider } from "@/modules/carrito-global/carrito"
import { AccesoProvider } from "@/modules/acceso/acceso"
import { FondoPublico } from "@/shared/components/marketing/fondo-publico"

/** Zona pública: landing, mercado y planes. Cabecera y pie propios, sin el armazón del panel. */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <AccesoProvider>
    <CarritoProvider>
      <div className="zona-vidrio flex min-h-screen flex-col bg-background">
        <FondoPublico />
        <CabeceraPublica />
        <main id="contenido" className="relative z-10 flex-1">
          {children}
        </main>
        <PiePublico />
      </div>
    </CarritoProvider>
    </AccesoProvider>
  )
}
