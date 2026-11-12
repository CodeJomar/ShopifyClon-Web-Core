"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, CircleCheck, Clock, PackageSearch } from "lucide-react"
import { claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { formatearFecha } from "@/shared/utils/fechas"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { obtenerPedido, type PedidoEjemplo } from "../pedidos-mock"
import { AvatarTienda } from "../components/tarjeta-tienda"
import { EstadoDespacho, LineaDespacho } from "../components/estado-despacho"

/** Un pedido con una sección por tienda: sus productos, su envío y el avance de su despacho. */
export function PedidoDetalleView({ id }: { id: string }) {
  const [pedido, setPedido] = React.useState<PedidoEjemplo | null | undefined>(undefined)

  React.useEffect(() => {
    // Se lee una sola vez al montar: los pedidos de ejemplo viven en el navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPedido(obtenerPedido(id))
  }, [id])

  if (pedido === undefined) return <div className={cn(claseContenedor, "py-14")} aria-busy="true" aria-label="Cargando el pedido" />

  if (pedido === null) {
    return (
      <div className={cn(claseContenedor, "flex flex-col items-center py-24 text-center")}>
        <PackageSearch aria-hidden="true" className="size-12 text-muted-foreground" strokeWidth={1.4} />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-foreground">No encontramos ese pedido</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Puede que se haya hecho desde otro navegador.</p>
        <Link href="/mis-pedidos" className={cn(claseBotonMarca, "mt-6")}>Ver mis pedidos</Link>
      </div>
    )
  }

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <Link href="/mis-pedidos" className="inline-flex items-center gap-1.5 rounded text-[13.5px] font-bold text-brand-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <ArrowLeft aria-hidden="true" className="size-4" /> Mis pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">Pedido {pedido.numero}</h1>
          <p className="mt-1 text-[14px] font-medium text-muted-foreground">{formatearFecha(pedido.creado_en)}</p>
        </div>
        <p className="text-[34px] font-extrabold leading-none tracking-tight text-foreground">{formatearDinero(pedido.total, "PEN")}</p>
      </div>

      <div className={cn("mt-6 flex items-start gap-3.5 rounded-2xl p-4 sm:p-5", pedido.pagado ? "bg-primary/10" : "bg-secondary")}>
        {pedido.pagado ? <CircleCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-brand-text" /> : <Clock aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-muted-foreground" />}
        <div>
          <p className="text-[15px] font-extrabold text-foreground">
            {pedido.pagado ? "Pago recibido: un solo pago para todo el pedido" : "Falta pagar a cada tienda"}
          </p>
          <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">
            {pedido.pagado
              ? "Repartimos automáticamente el dinero entre las tiendas. Cada una prepara y despacha lo suyo."
              : "Cada tienda te enviará sus datos de pago por correo y confirmará su parte cuando la reciba."}
          </p>
        </div>
      </div>

      <ul className="mt-8 space-y-5">
        {pedido.ordenes.map((o) => (
          <li key={o.tienda.subdominio} className="overflow-hidden rounded-3xl border border-island-border bg-card shadow-isla">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
              <Link href={`/mercado/tienda/${o.tienda.subdominio}`} className="flex items-center gap-3 rounded-lg outline-none hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/40">
                <AvatarTienda tienda={o.tienda} className="size-10 rounded-xl text-[16px]" />
                <span className="text-[16px] font-extrabold tracking-tight">{o.tienda.nombre}</span>
              </Link>
              <EstadoDespacho estado={o.estado} />
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_1fr]">
              <div>
                <ul className="space-y-2 text-[14px]">
                  {o.lineas.map((l) => (
                    <li key={l.titulo} className="flex justify-between gap-3">
                      <span className="text-foreground">{l.cantidad} × {l.titulo}</span>
                      <span className="shrink-0 font-bold">{formatearDinero(l.precio * l.cantidad, "PEN")}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-3 text-muted-foreground">
                    <span>Envío</span>
                    <span className="font-semibold">{o.envio === 0 ? "Sin envío" : formatearDinero(o.envio, "PEN")}</span>
                  </li>
                  <li className="flex justify-between gap-3 border-t border-border/60 pt-2 text-[15px] font-extrabold">
                    <span>Total de la tienda</span>
                    <span>{formatearDinero(o.total, "PEN")}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <LineaDespacho estado={o.estado} />
                {o.numero_guia && (
                  <p className="rounded-xl bg-secondary px-3.5 py-2.5 text-[12.5px] font-medium text-muted-foreground">
                    {o.transportista}, guía <span className="font-mono font-bold text-foreground">{o.numero_guia}</span>
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
