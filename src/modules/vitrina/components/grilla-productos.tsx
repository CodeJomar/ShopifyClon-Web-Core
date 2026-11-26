import type { ProductoResumenVitrina } from "@/dtos/vitrina"
import type { Diseno } from "@/modules/apariencia/catalogo"
import { cn } from "@/shared/utils/cn"
import { TarjetaProducto } from "./tarjeta-producto"

const COLUMNAS: Record<Diseno, string> = {
  CUADRICULA: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  REVISTA: "grid-cols-2 sm:grid-cols-3",
  LISTA: "grid-cols-1 sm:grid-cols-2",
  PORTADA: "grid-cols-2 sm:grid-cols-3",
}

/** Catálogo de la vitrina con el diseño que eligió el propietario (Cuadrícula, Revista, Lista amplia o Vitrina con portada). */
export function GrillaProductos({ productos, subdominio, moneda, diseno }: { productos: ProductoResumenVitrina[]; subdominio: string; moneda: string; diseno: Diseno }) {
  return (
    <div className={cn("grid gap-4 sm:gap-6", COLUMNAS[diseno])}>
      {productos.map((prod, i) => (
        // En «Revista» el primer producto ocupa más espacio.
        <div key={prod.identificador_url} className={cn(diseno === "REVISTA" && i === 0 && "col-span-2 sm:row-span-2 [&>a]:h-full")}>
          <TarjetaProducto producto={prod} subdominio={subdominio} moneda={moneda} />
        </div>
      ))}
    </div>
  )
}
