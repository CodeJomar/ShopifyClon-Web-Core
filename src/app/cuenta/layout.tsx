import { CabeceraPublica } from "@/shared/components/marketing/cabecera-publica"
import { PiePublico } from "@/shared/components/marketing/pie-publico"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { CarritoProvider } from "@/modules/carrito-global/carrito"
import { AccesoProvider } from "@/modules/acceso/acceso"
import { NavegacionCuenta } from "@/modules/cuenta/components/navegacion-cuenta"
import { cn } from "@/shared/utils/cn"

/**
 * «Mi cuenta» vive en la zona pública (cabecera y pie del sitio), no en el panel de una tienda: es la cuenta de una persona, que
 * compra y, si quiere, también vende. Las rutas siguen protegidas por el guard de sesión.
 */
export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccesoProvider>
      <CarritoProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <CabeceraPublica />
          <main id="contenido" className="flex-1">
            <div className={cn(claseContenedor, "grid grid-cols-[minmax(0,1fr)] gap-6 py-8 sm:py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10")}>
              <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 hidden px-3.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground lg:block">Mi cuenta</p>
                <NavegacionCuenta />
              </aside>
              <div className="min-w-0">{children}</div>
            </div>
          </main>
          <PiePublico />
        </div>
      </CarritoProvider>
    </AccesoProvider>
  )
}
