"use client"

import { ArrowDownCircle, ArrowUpCircle, Coins, ReceiptText, Undo2 } from "lucide-react"
import type { MetodoPago, MovimientoHistorialDto } from "@/dtos/caja"
import { usePaginacionAjustada } from "@/shared/hooks"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { cn } from "@/shared/utils/cn"
import { formatearDinero } from "@/shared/utils/dinero"
import { METODO_PAGO_LABELS, TIPO_MOVIMIENTO_LABELS, codigoCortoPedido } from "../schema"
import { ALTO_MOVIMIENTO, UNA_COLUMNA } from "./medidas"
import { panelClass, textoSecundario, textoTitulo } from "./estilos"
import { EncabezadoPanel } from "./encabezado-panel"
import { PanelVacio } from "./panel-vacio"
import { formatHora } from "../utils"

// Registro de movimientos del turno, paginado según el alto disponible
export function PanelMovimientos({
  movimientos,
  className,
}: {
  movimientos: MovimientoHistorialDto[]
  className?: string
}) {
  const paginacion = usePaginacionAjustada(movimientos, { altoItem: ALTO_MOVIMIENTO, anchoMinimo: UNA_COLUMNA, gap: 0 })

  return (
    <section
      className={cn(panelClass, "min-h-0 flex-col gap-3 overflow-hidden p-4", className)}
      aria-label="Movimientos del turno de caja"
    >
      <EncabezadoPanel titulo="Movimientos del turno" detalle={`${movimientos.length} operaciones`} />
      {movimientos.length === 0 ? (
        <PanelVacio
          icono={Coins}
          titulo="Sin movimientos aún"
          texto="Al cobrar cuentas o registrar entradas/salidas se listarán aquí."
        />
      ) : (
        <>
          <GrillaAjustada paginacion={paginacion} etiqueta="Movimientos del turno">
            {paginacion.visibles.map((mov) => (
              <li key={mov.id_transaccion_caja} className="min-h-0">
                <MovimientoItem movimiento={mov} />
              </li>
            ))}
          </GrillaAjustada>
          <BarraPaginacion paginacion={paginacion} etiqueta="movimientos" />
        </>
      )}
    </section>
  )
}

function MovimientoItem({ movimiento }: { movimiento: MovimientoHistorialDto }) {
  const suma = movimiento.tipo_movimiento === "venta" || movimiento.tipo_movimiento === "ingreso_manual"
  const Icono =
    movimiento.tipo_movimiento === "venta"
      ? ReceiptText
      : movimiento.tipo_movimiento === "devolucion"
        ? Undo2
        : suma
          ? ArrowDownCircle
          : ArrowUpCircle

  const colorIcono =
    movimiento.tipo_movimiento === "venta"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300"
      : suma
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"

  const concepto =
    movimiento.notas || (movimiento.id_pedido ? `Cobro ${codigoCortoPedido(movimiento.id_pedido)}` : TIPO_MOVIMIENTO_LABELS[movimiento.tipo_movimiento])

  return (
    <div className="flex h-full items-center justify-between gap-3 border-b border-slate-100 text-sm dark:border-stone-800">
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", colorIcono)}>
          <Icono className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className={cn("truncate font-semibold", textoTitulo)}>{concepto}</span>
          <span className={cn("truncate text-xs", textoSecundario)}>
            {formatHora(movimiento.fecha_creacion)} · {METODO_PAGO_LABELS[movimiento.metodo_pago as MetodoPago]} · Por{" "}
            {movimiento.registrado_por}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span
          className={cn(
            "font-bold tabular-nums",
            suma ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}
        >
          {suma ? "+" : "-"} {formatearDinero(movimiento.monto)}
        </span>
        {movimiento.id_pedido && (
          <span className={cn("text-[11px] font-mono", textoSecundario)}>{codigoCortoPedido(movimiento.id_pedido)}</span>
        )}
      </div>
    </div>
  )
}
