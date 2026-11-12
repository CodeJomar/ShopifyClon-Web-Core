import { TarjetaTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { listarTiendas } from "@/modules/mercado/datos"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { cn } from "@/shared/utils/cn"

// Datos vivos del mercado: no se prerenderiza al compilar.
export const dynamic = "force-dynamic"

export const metadata = { title: "Tiendas | OTemu", description: "Las tiendas independientes que venden en OTemu." }

export default async function Tiendas() {
  const tiendas = await listarTiendas()
  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[44px]">Tiendas</h1>
      <p className="mt-2 max-w-xl text-[15px] font-medium text-muted-foreground">
        Cada tienda es independiente: tiene su catálogo, sus precios y despacha sus propios pedidos.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiendas.map((t) => (
          <li key={t.subdominio}>
            <TarjetaTienda tienda={t} />
          </li>
        ))}
      </ul>
    </div>
  )
}
