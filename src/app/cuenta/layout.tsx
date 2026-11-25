import { CabeceraPublica } from "@/shared/components/marketing/cabecera-publica"
import { PiePublico } from "@/shared/components/marketing/pie-publico"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { CarritoProvider } from "@/modules/carrito-global/carrito"
import { AccesoProvider } from "@/modules/acceso/acceso"
import { FondoPublico } from "@/shared/components/marketing/fondo-publico"
import { NavegacionCuenta } from "@/modules/cuenta/components/navegacion-cuenta"
import { cn } from "@/shared/utils/cn"

/**
 * «Mi cuenta» vive en la zona pública (cabecera y pie del sitio), no en el panel de una tienda: es la cuenta de una persona, que
 * compra y, si quiere, también vende. Sin columna lateral: una tira de pestañas arriba y el contenido a todo el ancho.
 * Las rutas siguen protegidas por el guard de sesión.
 */
export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccesoProvider>
      <CarritoProvider>
        <div className="zona-vidrio flex min-h-screen flex-col bg-background">
          <FondoPublico />
          <CabeceraPublica />
          <main id="contenido" className="relative z-10 flex-1">
            <div className={cn(claseContenedor, "space-y-6 py-8 sm:py-12")}>
              <NavegacionCuenta />
              <div className="min-w-0">{children}</div>
            </div>
          </main>
          <PiePublico />
        </div>
      </CarritoProvider>
    </AccesoProvider>
  )
}
