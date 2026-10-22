import * as React from "react"
import { Check, Package, ReceiptText, Truck, Wallet, X } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import type { EstadoOrden, EstadoPago, EstadoPreparacion } from "@/dtos/ordenes"

interface ProgresoOrdenProps {
  estado: EstadoOrden
  estadoPago: EstadoPago
  estadoPreparacion: EstadoPreparacion
  /** Estado del envío si ya existe uno (CREADO, EN_TRANSITO, ENTREGADO, DEVUELTO). */
  estadoEnvio?: string
}

type Situacion = "hecho" | "actual" | "pendiente"

/** Línea de progreso de la orden: recibida → pagada → preparada → en camino → entregada. Solo lee estados que ya trae la API. */
export function ProgresoOrden({ estado, estadoPago, estadoPreparacion, estadoEnvio }: ProgresoOrdenProps) {
  const cancelada = estado === "CANCELADA"
  const pagada = estadoPago === "PAGADO" || estadoPago === "PARCIALMENTE_REEMBOLSADO" || estadoPago === "REEMBOLSADO"
  const preparada = estadoPreparacion === "PREPARADO" || estadoPreparacion === "ENTREGADO"
  const enCamino = estadoEnvio === "EN_TRANSITO" || estadoEnvio === "ENTREGADO" || estadoPreparacion === "ENTREGADO"
  const entregada = estadoPreparacion === "ENTREGADO" || estadoEnvio === "ENTREGADO"

  const hechos = [true, pagada, preparada, enCamino, entregada]
  const primeroPendiente = hechos.findIndex((h) => !h)

  const pasos = [
    { etiqueta: "Recibida", icono: ReceiptText },
    { etiqueta: "Pagada", icono: Wallet },
    { etiqueta: "Preparada", icono: Package },
    { etiqueta: "En camino", icono: Truck },
    { etiqueta: "Entregada", icono: Check },
  ].map((paso, i): typeof paso & { situacion: Situacion } => ({
    ...paso,
    situacion: hechos[i] ? "hecho" : i === primeroPendiente ? "actual" : "pendiente",
  }))

  if (cancelada) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-destructive/9 px-4 py-3 text-destructive-text" role="status">
        <X aria-hidden="true" className="size-5 shrink-0" />
        <p className="text-[13px] font-bold">Esta orden fue cancelada.</p>
      </div>
    )
  }

  return (
    <ol className="flex items-start" aria-label="Progreso de la orden">
      {pasos.map((paso, i) => (
        <li key={paso.etiqueta} className="relative flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={paso.situacion === "actual" ? "step" : undefined}>
          {i > 0 && (
            <span
              aria-hidden="true"
              className={cn("absolute right-1/2 top-[17px] h-0.5 w-full -translate-y-1/2", pasos[i - 1].situacion === "hecho" && paso.situacion !== "pendiente" ? "bg-primary" : "bg-border")}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex size-9 items-center justify-center rounded-full border-2 transition-colors",
              paso.situacion === "hecho" && "border-primary bg-primary text-primary-foreground",
              paso.situacion === "actual" && "border-primary bg-card text-brand-text ring-4 ring-primary/18",
              paso.situacion === "pendiente" && "border-border bg-card text-muted-foreground",
            )}
          >
            {paso.situacion === "hecho" ? <Check aria-hidden="true" className="size-4" /> : <paso.icono aria-hidden="true" className="size-4" />}
          </span>
          <span className={cn("text-[11.5px] font-bold sm:text-[12.5px]", paso.situacion === "pendiente" ? "text-muted-foreground" : "text-foreground")}>{paso.etiqueta}</span>
        </li>
      ))}
    </ol>
  )
}
