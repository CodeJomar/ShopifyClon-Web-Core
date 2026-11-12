import { Check, PackageCheck, Truck } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import type { OrdenDePedido } from "@/dtos/carrito-global"

/** Cómo ve la persona el avance de una tienda dentro del pedido. */
export type EstadoOrdenTienda = "ESPERANDO_PAGO" | "PREPARANDO" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO"

/** Estado visible de la orden de una tienda, a partir de sus estados de pago, preparación y cierre. */
export function despachoDeOrden(o: Pick<OrdenDePedido, "estado" | "estado_pago" | "estado_preparacion">): EstadoOrdenTienda {
  if (o.estado === "CANCELADA") return "CANCELADO"
  if (o.estado_preparacion === "ENTREGADO") return "ENTREGADO"
  if (o.estado_preparacion === "PREPARADO") return "EN_CAMINO"
  return o.estado_pago === "PAGADO" ? "PREPARANDO" : "ESPERANDO_PAGO"
}

const TEXTO: Record<EstadoOrdenTienda, string> = {
  ESPERANDO_PAGO: "Esperando pago",
  CANCELADO: "Cancelado",
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
        (estado === "PREPARANDO" || estado === "ESPERANDO_PAGO") && "bg-secondary text-muted-foreground",
        estado === "CANCELADO" && "bg-tono-peligro-bg text-tono-peligro-fg",
        className,
      )}
    >
      {TEXTO[estado]}
    </span>
  )
}

const PASOS: { estado: "PREPARANDO" | "EN_CAMINO" | "ENTREGADO"; texto: string; icono: typeof Check }[] = [
  { estado: "PREPARANDO", texto: "Preparando", icono: PackageCheck },
  { estado: "EN_CAMINO", texto: "En camino", icono: Truck },
  { estado: "ENTREGADO", texto: "Entregado", icono: Check },
]

/** Línea de avance de un despacho: preparando → en camino → entregado. */
export function LineaDespacho({ estado }: { estado: EstadoOrdenTienda }) {
  const actual = PASOS.findIndex((p) => p.estado === estado)
  if (estado === "ESPERANDO_PAGO" || estado === "CANCELADO") return null
  return (
    <ol className="flex items-start" aria-label="Avance del despacho">
      {PASOS.map((p, i) => {
        const hecho = i <= actual
        const Icono = p.icono
        return (
          <li key={p.estado} className="relative flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={i === actual ? "step" : undefined}>
            {i > 0 && <span aria-hidden="true" className={cn("absolute right-1/2 top-[17px] h-0.5 w-full -translate-y-1/2", i <= actual ? "bg-primary" : "bg-border")} />}
            <span
              className={cn(
                "relative z-10 flex size-9 items-center justify-center rounded-full border-2",
                hecho ? "border-transparent bg-primary text-sobre-marca" : "border-border bg-card text-muted-foreground",
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
