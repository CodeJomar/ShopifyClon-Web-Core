"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, LogIn, PackageOpen } from "lucide-react"
import { claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { useAcceso } from "@/modules/acceso/acceso"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import { formatearFecha } from "@/shared/utils/fechas"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import type { PedidoDto } from "@/dtos/carrito-global"
import { AvatarTienda } from "../components/tarjeta-tienda"
import { despachoDeOrden, EstadoDespacho } from "../components/estado-despacho"

interface PaginaPedidos {
  datos: PedidoDto[]
}

/** «Mis pedidos»: cada compra de la cuenta con sus tiendas y el estado de cada despacho. */
export function MisPedidosView() {
  const { acceso } = useAcceso()
  const [pedidos, setPedidos] = React.useState<PedidoDto[] | null>(null)
  const autenticado = acceso.estado === "autenticado"

  React.useEffect(() => {
    if (!autenticado) return
    let cancelado = false
    void resultado(peticionApi<PaginaPedidos>({ method: "GET", url: "/cuenta/pedidos", sinRedireccion401: true })).then((res) => {
      if (!cancelado) setPedidos(res.ok ? res.datos.datos : [])
    })
    return () => {
      cancelado = true
    }
  }, [autenticado])

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">Mis pedidos</h1>
      <p className="mt-2 text-[15px] font-medium text-muted-foreground">Cada compra reúne los productos de todas las tiendas; cada tienda despacha lo suyo.</p>

      {acceso.estado === "anonimo" ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <LogIn aria-hidden="true" className="size-11 text-muted-foreground" strokeWidth={1.4} />
          <h2 className="mt-4 text-[20px] font-extrabold tracking-tight text-foreground">Inicia sesión para ver tus pedidos</h2>
          <p className="mt-1 max-w-md text-[14px] text-muted-foreground">Si compraste sin cuenta, abre el enlace del pedido que te enviamos por correo.</p>
          <Link href="/login?siguiente=%2Fmis-pedidos" className={cn(claseBotonMarca, "mt-6")}>Iniciar sesión</Link>
        </div>
      ) : acceso.estado === "cargando" || pedidos === null ? (
        <div className="mt-8 h-40 animate-pulse rounded-3xl bg-secondary" aria-busy="true" aria-label="Cargando tus pedidos" />
      ) : pedidos.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <PackageOpen aria-hidden="true" className="size-11 text-muted-foreground" strokeWidth={1.4} />
          <h2 className="mt-4 text-[20px] font-extrabold tracking-tight text-foreground">Aún no tienes pedidos</h2>
          <p className="mt-1 max-w-md text-[14px] text-muted-foreground">Cuando compres, aquí verás el avance de cada envío.</p>
          <Link href="/mercado" className={cn(claseBotonMarca, "mt-6")}>Explorar el mercado</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {pedidos.map((p) => (
            <li key={p.pedido_id}>
              <Link href={`/mis-pedidos/${encodeURIComponent(p.token_acceso)}`} className="group block rounded-3xl vidrio p-6 outline-none transition-all hover:-translate-y-0.5 hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[17px] font-extrabold tracking-tight text-foreground">Pedido {p.numero_pedido}</p>
                    <p className="text-[13px] font-medium text-muted-foreground">{formatearFecha(p.fecha_creacion)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[20px] font-extrabold tracking-tight text-foreground">{formatearDinero(p.total, p.moneda)}</p>
                    <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-border/60 pt-4">
                  {p.ordenes.map((o) => (
                    <li key={o.orden_id} className="flex items-center gap-2.5">
                      <AvatarTienda tienda={o.tienda} className="size-8 rounded-lg text-[13px]" />
                      <span className="text-[13.5px] font-bold text-foreground">{o.tienda.nombre}</span>
                      <EstadoDespacho estado={despachoDeOrden(o)} />
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
