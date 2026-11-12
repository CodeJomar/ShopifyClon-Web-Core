import { Check, PackageCheck, Truck } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import type { EstadoOrdenTienda } from "../pedidos-mock"

const TEXTO: Record<EstadoOrdenTienda, string> = {
  PREPARANDO: "Preparando",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
}

/** Insignia del estado de despacho de una tienda dentro de un pedido. */
export function EstadoDespacho({ estado, className }: { estado: EstadoOrdenTienda; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-extrabold",
        estado === "ENTREGADO" && "bg-success/16 text-brand-text",
        estado === "EN_CAMINO" && "bg-info/16 text-info-text",
        estado === "PREPARANDO" && "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {TEXTO[estado]}
    </span>
  )
}

const PASOS: { estado: EstadoOrdenTienda; texto: string; icono: typeof Check }[] = [
  { estado: "PREPARANDO", texto: "Preparando", icono: PackageCheck },
  { estado: "EN_CAMINO", texto: "En camino", icono: Truck },
  { estado: "ENTREGADO", texto: "Entregado", icono: Check },
]

/** Línea de avance de un despacho: preparando → en camino → entregado. */
export function LineaDespacho({ estado }: { estado: EstadoOrdenTienda }) {
  const actual = PASOS.findIndex((p) => p.estado === estado)
  return (
    <ol className="flex items-start" aria-label="Avance del despacho">
      {PASOS.map((p, i) => {
        const hecho = i <= actual
        const Icono = p.icono
        return (
          <li key={p.estado} className="relative flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={i === actual ? "step" : undefined}>
            {i > 0 && <span aria-hidden="true" className={cn("absolute right-1/2 top-[17px] h-0.5 w-full -translate-y-1/2", i <= actual ? "bg-grad-marca" : "bg-border")} />}
            <span
              className={cn(
                "relative z-10 flex size-9 items-center justify-center rounded-full border-2",
                hecho ? "border-transparent bg-grad-marca text-sobre-marca" : "border-border bg-card text-muted-foreground",
              )}
            >
              <Icono aria-hidden="true" className="size-4" />
            </span>
            <span className={cn("text-[12px] font-bold", hecho ? "text-foreground" : "text-muted-foreground")}>{p.texto}</span>
          </li>
        )
      })}
    </ol>
  )
}
