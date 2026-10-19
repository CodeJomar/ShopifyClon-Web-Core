"use client"

import * as React from "react"
import { ChefHat, Clock, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import type { TarjetaKdsDto } from "@/dtos/kds"
import { codigoComanda, destinoComanda, minutosDesde, textoMinutos, textoModificadores, TIPO_PEDIDO_LABELS, totalUnidades } from "../schema"
import { ESTADO_COMANDA_CONFIG, ESTADO_ITEM_CONFIG } from "./config-estados"
import { urgenciaClass } from "./estilos"

/* -------------------------------------------------------------------------- */
/*              Modal de detalle de comanda (vista de solo lectura)             */
/* -------------------------------------------------------------------------- */

interface DetalleComandaModalProps {
  tarjeta: TarjetaKdsDto
  /** Hora actual (la mantiene al día la vista principal). */
  ahora: number
  onClose: () => void
}

export function DetalleComandaModal({
  tarjeta,
  ahora,
  onClose,
}: DetalleComandaModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const tituloId = React.useId()
  const estado = tarjeta.estado === "en_preparacion" ? "en_preparacion" : "pendiente"
  const config = ESTADO_COMANDA_CONFIG[estado]
  const Icono = config.icon
  const minutos = minutosDesde(tarjeta.fecha_creacion, ahora)

  React.useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const filas = [
    { label: "Código", valor: codigoComanda(tarjeta) },
    { label: "Mesa / Destino", valor: destinoComanda(tarjeta) },
    ...(tarjeta.cliente_nombre ? [{ label: "Cliente", valor: tarjeta.cliente_nombre }] : []),
    { label: "Tipo", valor: TIPO_PEDIDO_LABELS[tarjeta.tipo_pedido] },
    { label: "Tiempo", valor: textoMinutos(minutos) },
    { label: "Total productos", valor: `${totalUnidades(tarjeta)} u.` },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs dark:bg-black/70"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl outline-none animate-in fade-in-0 zoom-in-95 duration-150 dark:border-stone-800 dark:bg-stone-900"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-stone-800">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-[#E7B7BC]">
                <ChefHat className="size-4" />
              </span>
              <h2
                id={tituloId}
                className="text-lg font-bold text-slate-900 dark:text-stone-100"
              >
                Detalle de Comanda
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  config.badge
                )}
              >
                <Icono className="size-3" />
                {config.label}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold tabular-nums",
                  urgenciaClass(minutos)
                )}
              >
                <Clock className="size-3" />
                {textoMinutos(minutos)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Datos de la comanda */}
        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4 dark:divide-stone-800 dark:border-stone-800">
            {filas.map((fila) => (
              <li
                key={fila.label}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-slate-500 dark:text-stone-400">{fila.label}</span>
                <span className="font-semibold text-slate-900 dark:text-stone-100">
                  {fila.valor}
                </span>
              </li>
            ))}
          </ul>

          {/* Lista de productos */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400">
              Productos
            </span>
            <ul className="flex flex-col gap-2 rounded-2xl border border-slate-100 px-4 py-3 dark:border-stone-800">
              {tarjeta.items.map((item) => {
                const estadoItem = ESTADO_ITEM_CONFIG[item.estado_kds]
                const modificadores = textoModificadores(item)
                return (
                  <li key={item.id_pedido_detalle} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-700 dark:text-stone-200">
                        <span className="font-semibold tabular-nums text-slate-900 dark:text-stone-100">{item.cantidad}x</span>{" "}
                        {item.nombre_producto}
                      </span>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", estadoItem.chip)}>
                        {estadoItem.label}
                      </span>
                    </div>
                    {modificadores && <span className="text-[11px] text-slate-400 dark:text-stone-500 pl-5">{modificadores}</span>}
                    {item.notas_preparacion && (
                      <span className="text-[11px] italic text-amber-600 dark:text-amber-400 pl-5">📝 {item.notas_preparacion}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 p-5 dark:border-stone-800">
          <Button type="button" variant="neutral" size="md" onClick={onClose} className="w-44">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
