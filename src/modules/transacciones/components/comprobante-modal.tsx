"use client"

import { Ban, Printer, Undo2 } from "lucide-react"

import type { MetodoPago } from "@/dtos/caja"
import type { ComprobanteDto, EventoPedidoDto } from "@/dtos/pedidos"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { aCentimos, formatearCentimos, formatearDinero } from "@/shared/utils/dinero"

import { ESTADO_PEDIDO_LABELS, METODO_PAGO_LABELS, numeroPedido } from "../schema"
import { formatFechaHora } from "../utils"
import { ESTADO_PEDIDO_CONFIG, EVENTO_PAGO_CONFIG } from "./config-visual"
import { botonPeligroClass, textoCuerpo, textoEtiqueta, textoSecundario, textoTitulo } from "./estilos"
import { ModalShell, PieAcciones } from "./modal-shell"
import { BitacoraPedido } from "./bitacora-pedido"

export type CobroDevolvible = ComprobanteDto["pagos"][number] & { devolvibleCentimos: number }

/** Cuánto se puede devolver aún de cada cobro: lo cobrado menos lo ya devuelto de ese mismo cobro. */
export function cobrosDevolvibles(comprobante: ComprobanteDto): CobroDevolvible[] {
  return comprobante.pagos.map((pago) => {
    const devuelto = comprobante.devoluciones
      .filter((d) => d.id_transaccion_origen === pago.id_transaccion)
      .reduce((acc, d) => acc + aCentimos(d.monto), 0)
    return { ...pago, devolvibleCentimos: Math.max(0, aCentimos(pago.monto) - devuelto) }
  })
}

interface ComprobanteModalProps {
  comprobante: ComprobanteDto
  eventos: EventoPedidoDto[]
  puedeDevolver: boolean
  puedeAnular: boolean
  reimprimiendo: boolean
  onClose: () => void
  onDevolver: (cobro: CobroDevolvible) => void
  onAnular: () => void
  onReimprimir: () => void
}

/** Comprobante interno del pedido: ticket, cobros y devoluciones, bitácora y acciones (devolver, anular, reimprimir). */
export function ComprobanteModal({
  comprobante,
  eventos,
  puedeDevolver,
  puedeAnular,
  reimprimiendo,
  onClose,
  onDevolver,
  onAnular,
  onReimprimir,
}: ComprobanteModalProps) {
  const cobros = cobrosDevolvibles(comprobante)
  const estadoConf = ESTADO_PEDIDO_CONFIG[comprobante.estado]
  const sinPagos = comprobante.pagos.length === 0
  const lugar = comprobante.tipo_pedido === "salon" && comprobante.mesa_numero ? `Mesa ${comprobante.mesa_numero}` : "Para llevar"

  return (
    <ModalShell
      titulo={`Pedido ${numeroPedido(comprobante.correlativo)}`}
      subtitulo={`${lugar} · ${formatFechaHora(comprobante.fecha)}${comprobante.cliente_nombre ? ` · ${comprobante.cliente_nombre}` : ""}`}
      icono={<Printer className="size-5" />}
      ancho="max-w-xl"
      onClose={onClose}
    >
      <div className="flex flex-col gap-5 overflow-y-auto p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", estadoConf.badge)}>
            <span className={cn("size-1.5 rounded-full", estadoConf.dot)} />
            {ESTADO_PEDIDO_LABELS[comprobante.estado]}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-stone-800 dark:text-stone-200">
            Pago: {comprobante.estado_pago.replace("_", " ")}
          </span>
          {comprobante.reimpresiones > 0 && (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
              {comprobante.reimpresiones} {comprobante.reimpresiones === 1 ? "copia impresa" : "copias impresas"}
            </span>
          )}
        </div>

        {/* Ticket en papel: se mantiene claro también en modo oscuro para simular la impresión */}
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 font-mono text-xs text-slate-800 shadow-inner dark:border-stone-600 dark:bg-stone-100 dark:text-stone-900">
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-sm font-bold tracking-wide">COFFY FLOW</span>
            <span>Comprobante interno de consumo</span>
            <span className="font-bold">{numeroPedido(comprobante.correlativo)}</span>
          </div>
          {(comprobante.atendido_por || comprobante.cliente_nombre) && (
            <div className="flex flex-col gap-0.5 border-t border-dashed border-slate-300 pt-2 dark:border-stone-400">
              {comprobante.cliente_nombre && <FilaTicket label="Cliente" valor={comprobante.cliente_nombre} />}
              {comprobante.atendido_por && <FilaTicket label="Atendió" valor={comprobante.atendido_por} />}
            </div>
          )}
          <ul className="flex flex-col gap-1 border-y border-dashed border-slate-300 py-2 dark:border-stone-400">
            {comprobante.items.map((item, i) => (
              <li key={`${item.producto}-${i}`} className="flex flex-col">
                <span className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.cantidad} x {item.producto}
                  </span>
                  <span className="tabular-nums">{formatearDinero(item.subtotal)}</span>
                </span>
                {item.modificadores.length > 0 && (
                  <span className="pl-3 text-[10px] opacity-70">{item.modificadores.map((m) => m.opcion).join(", ")}</span>
                )}
                {item.notas_preparacion && <span className="pl-3 text-[10px] italic opacity-70">{item.notas_preparacion}</span>}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-0.5">
            <FilaTicket label="Op. gravada" valor={formatearDinero(comprobante.desglose.base_imponible)} />
            <FilaTicket label="IGV 18%" valor={formatearDinero(comprobante.desglose.igv_18)} />
            {aCentimos(comprobante.descuento) > 0 && <FilaTicket label="Descuento" valor={`- ${formatearDinero(comprobante.descuento)}`} />}
            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span className="tabular-nums">{formatearDinero(comprobante.total)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 border-t border-dashed border-slate-300 pt-2 dark:border-stone-400">
            <FilaTicket label="Pagado" valor={formatearDinero(comprobante.total_pagado)} />
            {aCentimos(comprobante.total_devuelto) > 0 && <FilaTicket label="Devuelto" valor={`- ${formatearDinero(comprobante.total_devuelto)}`} />}
            <FilaTicket label="Saldo pendiente" valor={formatearDinero(comprobante.saldo_pendiente)} />
          </div>
          <p className="text-center text-[10px]">{comprobante.aviso}</p>
        </div>

        {/* Cobros y devoluciones */}
        <div className="flex flex-col gap-3">
          <span className={textoEtiqueta}>Cobros y devoluciones</span>
          {sinPagos ? (
            <p className={cn("text-sm", textoSecundario)}>Este pedido todavía no tiene cobros.</p>
          ) : (
            <ol className="relative flex flex-col gap-4 border-l border-slate-200 pl-5 dark:border-stone-700">
              {[
                ...cobros.map((c) => ({ tipo: "pago" as const, fecha: c.fecha, c })),
                ...comprobante.devoluciones.map((d) => ({ tipo: "devolucion" as const, fecha: d.fecha, d })),
              ]
                .sort((a, b) => a.fecha.localeCompare(b.fecha))
                .map((evento) => {
                  const conf = EVENTO_PAGO_CONFIG[evento.tipo]
                  const Icono = conf.icon
                  const esPago = evento.tipo === "pago"
                  const dato = esPago ? evento.c : evento.d
                  return (
                    <li key={dato.id_transaccion} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[31px] flex size-5 items-center justify-center rounded-full ring-4 ring-white dark:ring-stone-900",
                          conf.className
                        )}
                      >
                        <Icono className="size-3" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className={cn("text-sm font-semibold", textoTitulo)}>
                            {esPago ? "Cobro" : "Devolución"} · {METODO_PAGO_LABELS[dato.metodo_pago as MetodoPago]}
                          </span>
                          <span className={cn("text-sm font-bold tabular-nums", esPago ? textoTitulo : "text-red-600 dark:text-red-400")}>
                            {esPago ? "" : "- "}
                            {formatearDinero(dato.monto)}
                          </span>
                        </div>
                        <span className={cn("text-[11px]", textoSecundario)}>
                          {formatFechaHora(dato.fecha)} · {dato.registrado_por}
                        </span>
                        {!esPago && <span className={cn("text-xs", textoCuerpo)}>Motivo: {evento.d.motivo}</span>}
                        {esPago && puedeDevolver && evento.c.devolvibleCentimos > 0 && (
                          <button
                            type="button"
                            onClick={() => onDevolver(evento.c)}
                            className="mt-1 inline-flex w-fit cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15"
                          >
                            <Undo2 className="size-3.5" /> Devolver (hasta {formatearCentimos(evento.c.devolvibleCentimos)})
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
            </ol>
          )}
        </div>

        <BitacoraPedido eventos={eventos} />
      </div>

      <PieAcciones>
        {puedeAnular && comprobante.estado !== "anulado" && comprobante.estado !== "pagado" && sinPagos && (
          <Button type="button" size="md" onClick={onAnular} leftIcon={<Ban className="size-4" />} className={botonPeligroClass}>
            Anular
          </Button>
        )}
        <Button
          type="button"
          variant="neutral"
          size="md"
          onClick={onReimprimir}
          disabled={reimprimiendo}
          leftIcon={<Printer className="size-4" />}
        >
          {reimprimiendo ? "Preparando…" : "Reimprimir"}
        </Button>
        <Button id="comprobante-cerrar" type="button" size="md" onClick={onClose}>
          Cerrar
        </Button>
      </PieAcciones>
    </ModalShell>
  )
}

function FilaTicket({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="truncate text-right tabular-nums">{valor}</span>
    </div>
  )
}
