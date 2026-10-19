"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { PedidoRecienteDto } from "@/dtos/dashboard"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { cn } from "@/shared/utils/cn"
import { formatToCurrency } from "@/shared/utils/formatters"

import { ESTADO_PEDIDO_LABELS } from "../schema"
import { ESTADO_PEDIDO_CLASS, panelClass } from "./estilos"
import { PanelHeader } from "./panel-header"

const horaDe = (iso: string) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })

const lugarDe = (p: Pick<PedidoRecienteDto, "tipo_pedido" | "mesa_numero">) =>
  p.tipo_pedido === "salon" && p.mesa_numero ? `Mesa ${p.mesa_numero}` : p.tipo_pedido === "delivery" ? "Delivery" : "Para llevar"

interface PedidosRecientesProps {
  pedidos: PedidoRecienteDto[]
  enlace: boolean
  className?: string
}

/** Los últimos pedidos del periodo: número, lugar, cliente, estado y total. */
export function PedidosRecientes({ pedidos, enlace, className }: PedidosRecientesProps) {
  return (
    <section className={cn(panelClass, "flex flex-col gap-3 p-4 lg:p-5", className)}>
      <PanelHeader
        title="Pedidos recientes"
        subtitle="Últimos movimientos del local"
        action={
          enlace ? (
            <Link
              href="/transacciones/pedidos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C0107] hover:underline dark:text-[#E7B7BC]"
            >
              Ver todos <ChevronRight className="size-3.5" />
            </Link>
          ) : undefined
        }
      />

      {pedidos.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500 dark:text-stone-400">Aún no hay pedidos en este periodo.</p>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <Table className="min-w-[480px]">
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="h-auto px-0 pb-2 text-xs font-semibold">Pedido</TableHead>
                <TableHead className="h-auto px-0 pb-2 text-xs font-semibold">Lugar</TableHead>
                <TableHead className="h-auto px-0 pb-2 text-xs font-semibold">Cliente</TableHead>
                <TableHead className="h-auto px-0 pb-2 text-xs font-semibold">Estado</TableHead>
                <TableHead className="h-auto px-0 pb-2 text-right text-xs font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id_pedido} className="text-slate-700 hover:bg-transparent dark:text-stone-300">
                  <TableCell className="px-0 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-stone-100">#{pedido.correlativo}</span>
                      <span className="text-[11px] text-slate-500 dark:text-stone-500">{horaDe(pedido.fecha_creacion)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-0 py-2 text-xs">{lugarDe(pedido)}</TableCell>
                  <TableCell className="px-0 py-2 text-xs">{pedido.cliente_nombre ?? "—"}</TableCell>
                  <TableCell className="px-0 py-2">
                    <Badge variant="estado" className={ESTADO_PEDIDO_CLASS[pedido.estado]}>
                      {ESTADO_PEDIDO_LABELS[pedido.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-0 py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-stone-100">
                    {formatToCurrency(pedido.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
