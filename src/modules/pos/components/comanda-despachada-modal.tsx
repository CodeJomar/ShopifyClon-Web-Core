"use client"

import { ChefHat } from "lucide-react"
import type { PedidoCreadoDto } from "@/dtos/pedidos"
import { Button } from "@/shared/components/ui/button"
import { PieModal } from "./pie-modal"
import { formatearDinero } from "@/shared/utils/dinero"
import { ModalMarco } from "./modal-marco"

/* -------------------------------------------------------------------------- */
/*                Aviso al enviar la comanda a cocina / barra                  */
/* -------------------------------------------------------------------------- */

interface ComandaDespachadaModalProps {
  pedido: PedidoCreadoDto
  /** "Mesa 3" o "Para llevar". */
  destino: string
  onClose: () => void
}

export function ComandaDespachadaModal({ pedido, destino, onClose }: ComandaDespachadaModalProps) {
  const unidades = pedido.detalles.reduce((suma, d) => suma + d.cantidad, 0)
  const hora = new Date(pedido.fecha_creacion).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })

  return (
    <ModalMarco titulo="Comanda enviada" subtitulo="La cocina y la barra ya la están viendo" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <ChefHat className="size-10" />
        </span>
        <ul className="flex w-full flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4 text-sm dark:divide-stone-800 dark:border-stone-800">
          {[
            { label: "Comanda", valor: `#${pedido.correlativo}` },
            { label: "Destino", valor: destino },
            { label: "Hora", valor: hora },
            { label: "Productos", valor: `${unidades} u.` },
            { label: "Total", valor: formatearDinero(pedido.total_calculado) },
          ].map((fila) => (
            <li key={fila.label} className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 dark:text-stone-400">{fila.label}</span>
              <span className="font-semibold text-slate-900 dark:text-stone-100">{fila.valor}</span>
            </li>
          ))}
        </ul>
      </div>

      <PieModal>
        <Button id="pos-comanda-listo" type="button" size="md" onClick={onClose}>
          Listo
        </Button>
      </PieModal>
    </ModalMarco>
  )
}
