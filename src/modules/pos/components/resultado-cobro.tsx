"use client"

import { CircleCheck } from "lucide-react"
import type { CobroResultadoDto } from "@/dtos/caja"
import { Button } from "@/shared/components/ui/button"
import { formatearDinero } from "@/shared/utils/dinero"
import { METODO_PAGO_LABELS } from "../schema"
import { PieModal } from "./pie-modal"

export function ResultadoCobro({
  resultado,
  completo,
  onOtroPago,
  onCerrar,
}: {
  resultado: CobroResultadoDto
  completo: boolean
  onOtroPago: () => void
  onCerrar: () => void
}) {
  return (
    <>
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
        <CircleCheck className="size-10" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold text-slate-900 dark:text-stone-100">
          {completo ? "Cobro completado" : "Pago parcial registrado"}
        </p>
        <p className="text-sm text-slate-500 dark:text-stone-400">
          Cobrado {formatearDinero(resultado.total_pagado)} de {formatearDinero(resultado.total_pedido)}
        </p>
      </div>

      <ul className="flex w-full flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4 text-sm dark:divide-stone-800 dark:border-stone-800">
        {resultado.transacciones.map((t) => (
          <li key={t.id_transaccion_caja} className="flex items-center justify-between py-2.5">
            <span className="text-slate-600 dark:text-stone-300">{METODO_PAGO_LABELS[t.metodo_pago]}</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-stone-100">{formatearDinero(t.monto)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between py-2.5">
          <span className="text-slate-500 dark:text-stone-400">IGV incluido (18%)</span>
          <span className="tabular-nums text-slate-700 dark:text-stone-200">{formatearDinero(resultado.desglose.igv_18)}</span>
        </li>
        {!completo && (
          <li className="flex items-center justify-between py-2.5">
            <span className="font-semibold text-amber-700 dark:text-amber-400">Saldo pendiente</span>
            <span className="font-bold tabular-nums text-amber-700 dark:text-amber-400">
              {formatearDinero(resultado.saldo_pendiente)}
            </span>
          </li>
        )}
      </ul>

    </div>

    <PieModal>
      {!completo && (
        <Button type="button" variant="neutral" size="md" onClick={onOtroPago}>
          Registrar otro pago
        </Button>
      )}
      <Button type="button" size="md" onClick={onCerrar}>
        {completo ? "Listo" : "Cerrar"}
      </Button>
    </PieModal>
  </>
)
}