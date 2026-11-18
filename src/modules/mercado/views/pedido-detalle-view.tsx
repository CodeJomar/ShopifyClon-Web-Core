"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, CircleCheck, Clock, PackageSearch } from "lucide-react"
import { claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { PagoStripe } from "@/modules/checkout/components/pago-stripe"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import { formatearFecha } from "@/shared/utils/fechas"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import type { PagoPedidoDto, PedidoDto } from "@/dtos/carrito-global"
import { AvatarTienda } from "../components/tarjeta-tienda"
import { despachoDeOrden, EstadoDespacho, LineaDespacho } from "../components/estado-despacho"

const llamar = <T,>(c: Parameters<typeof peticionApi<T>>[0]) => resultado(peticionApi<T>({ ...c, sinRedireccion401: true }))

/** Un pedido con una sección por tienda: sus productos y el avance de su despacho. El enlace (token) basta para verlo y pagarlo. */
export function PedidoDetalleView({ token }: { token: string }) {
  const [pedido, setPedido] = React.useState<PedidoDto | null | undefined>(undefined)

  const cargar = React.useCallback(async () => {
    const res = await llamar<PedidoDto>({ method: "GET", url: `/pedidos/${encodeURIComponent(token)}` })
    setPedido(res.ok ? res.datos : null)
    return res.ok ? res.datos : null
  }, [token])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura inicial del pedido en la API
    void cargar()
  }, [cargar])

  // Tras pagar, el webhook de la API tarda unos segundos en marcar el pedido: se consulta hasta verlo pagado.
  const esperarPago = React.useCallback(async () => {
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 2500))
      const p = await cargar()
      if (p && p.estado_pago === "PAGADO") return true
    }
    return false
  }, [cargar])

  if (pedido === undefined) return <div className={cn(claseContenedor, "py-14")} aria-busy="true" aria-label="Cargando el pedido" />

  if (pedido === null) {
    return (
      <div className={cn(claseContenedor, "flex flex-col items-center py-24 text-center")}>
        <PackageSearch aria-hidden="true" className="size-12 text-muted-foreground" strokeWidth={1.4} />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-foreground">No encontramos ese pedido</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Revisa el enlace o entra a tu cuenta para ver tus pedidos.</p>
        <Link href="/mis-pedidos" className={cn(claseBotonMarca, "mt-6")}>Ver mis pedidos</Link>
      </div>
    )
  }

  const pagado = pedido.estado_pago === "PAGADO"
  const pendienteTarjeta = pedido.pasarela === "STRIPE" && pedido.estado_pago === "PENDIENTE"
  const moneda = pedido.moneda

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <Link href="/mis-pedidos" className="inline-flex items-center gap-1.5 rounded text-[13.5px] font-bold text-brand-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <ArrowLeft aria-hidden="true" className="size-4" /> Mis pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">Pedido {pedido.numero_pedido}</h1>
          <p className="mt-1 text-[14px] font-medium text-muted-foreground">{formatearFecha(pedido.fecha_creacion)}</p>
        </div>
        <p className="text-[34px] font-extrabold leading-none tracking-tight text-foreground">{formatearDinero(pedido.total, moneda)}</p>
      </div>

      <div className={cn("mt-6 flex items-start gap-3.5 rounded-2xl p-4 sm:p-5", pagado ? "bg-primary/10" : "bg-secondary")}>
        {pagado ? <CircleCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-brand-text" /> : <Clock aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-muted-foreground" />}
        <div>
          <p className="text-[15px] font-extrabold text-foreground">
            {pagado
              ? "Pago recibido: un solo pago para todo el pedido"
              : pedido.pasarela === "STRIPE"
                ? "Falta pagar con tarjeta"
                : pedido.estado_pago === "PARCIALMENTE_PAGADO"
                  ? "Algunas tiendas ya confirmaron su pago"
                  : "Falta pagar a cada tienda"}
          </p>
          <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">
            {pagado && pedido.pasarela === "STRIPE"
              ? "Repartimos automáticamente el dinero entre las tiendas. Cada una prepara y despacha lo suyo."
              : pedido.pasarela === "STRIPE"
                ? "Haces un solo pago por el total y la plataforma lo reparte entre las tiendas."
                : "Cada tienda te enviará sus datos de pago por correo y confirmará su parte cuando la reciba."}
          </p>
        </div>
      </div>

      {pendienteTarjeta && (
        <div className="mt-6 max-w-xl">
          <PagoStripe iniciar={() => llamar<PagoPedidoDto>({ method: "POST", url: `/pedidos/${encodeURIComponent(token)}/pagar` })} alPagar={esperarPago} />
        </div>
      )}

      <ul className="mt-8 space-y-5">
        {pedido.ordenes.map((o) => (
          <li key={o.orden_id} className="overflow-hidden rounded-3xl vidrio">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
              <Link href={`/mercado/tienda/${o.tienda.subdominio}`} className="flex items-center gap-3 rounded-lg outline-none hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/40">
                <AvatarTienda tienda={o.tienda} className="size-10 rounded-xl text-[16px]" />
                <span className="text-[16px] font-extrabold tracking-tight">{o.tienda.nombre}</span>
              </Link>
              <EstadoDespacho estado={despachoDeOrden(o)} />
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_1fr]">
              <ul className="space-y-2 text-[14px]">
                {o.items.map((l, i) => (
                  <li key={`${l.titulo_producto}-${i}`} className="flex justify-between gap-3">
                    <span className="text-foreground">{l.cantidad} × {l.titulo_producto}</span>
                    <span className="shrink-0 font-bold">{formatearDinero(l.total_linea, moneda)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-3 border-t border-border/60 pt-2 text-[15px] font-extrabold">
                  <span>Total de la tienda ({o.numero_orden})</span>
                  <span>{formatearDinero(o.total, moneda)}</span>
                </li>
              </ul>
              <div className="space-y-4">
                <LineaDespacho estado={despachoDeOrden(o)} />
                {pedido.pasarela === "MANUAL" && o.estado_pago !== "PAGADO" && (
                  <Link href={`/tienda/${o.tienda.subdominio}/orden/${o.token_acceso}`} className="inline-block rounded text-[13px] font-bold text-brand-text hover:underline">
                    Ver datos de pago de esta tienda
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
