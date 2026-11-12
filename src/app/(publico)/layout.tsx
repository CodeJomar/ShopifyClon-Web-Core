import { CabeceraPublica } from "@/shared/components/marketing/cabecera-publica"
import { PiePublico } from "@/shared/components/marketing/pie-publico"
import { CarritoEjemploProvider } from "@/modules/mercado/carrito-mock"

/** Zona pública: landing, mercado y planes. Cabecera y pie propios, sin el armazón del panel. */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <CarritoEjemploProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <CabeceraPublica />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <PiePublico />
      </div>
    </CarritoEjemploProvider>
  )
}
