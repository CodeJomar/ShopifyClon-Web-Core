"use client"

import { ChefHat, ReceiptText, ShoppingBag, Trash2, Utensils } from "lucide-react"
import type { PedidoListadoDto } from "@/dtos/pedidos"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { Button } from "@/shared/components/ui/button"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { cn } from "@/shared/utils/cn"
import { formatearCentimos, formatearDinero } from "@/shared/utils/dinero"
import { TIPOS_ATENCION, TIPO_ATENCION_LABELS, areaDeMesa, type ItemCarrito, type MesaPos, type TipoAtencion, type TotalesCarrito } from "../schema"
import { opcionClass, panelClass } from "./estilos"
import { ESTADO_MESA_CONFIG } from "@/shared/utils/mesa-visual"
import { TicketItem } from "./ticket-item"

/* -------------------------------------------------------------------------- */
/*                                   Ticket                                   */
/* -------------------------------------------------------------------------- */

export function TicketPanel({
  items,
  totales,
  mesas,
  tipoPedido,
  onTipoPedidoChange,
  mesaSeleccionada,
  pedidosMesa,
  saldoMesaCentimos,
  onMesaChange,
  nombreCliente,
  onNombreClienteChange,
  onCambiarCantidad,
  productosAgotados,
  onQuitar,
  onVaciar,
  puedeCrear,
  puedeCobrar,
  faltaMesa,
  mesaPorLimpiar,
  puedeEnviar,
  puedeCobrarAhora,
  enviandoComanda,
  onEnviarCocina,
  onCobrar,
  className,
}: {
  items: ItemCarrito[]
  totales: TotalesCarrito
  mesas: MesaPos[]
  tipoPedido: TipoAtencion
  onTipoPedidoChange: (tipo: TipoAtencion) => void
  mesaSeleccionada: MesaPos | null
  pedidosMesa: PedidoListadoDto[]
  saldoMesaCentimos: number
  onMesaChange: (mesaId: string) => void
  nombreCliente: string
  onNombreClienteChange: (nombre: string) => void
  onCambiarCantidad: (uid: string, delta: number) => void
  productosAgotados: ReadonlySet<string>
  onQuitar: (uid: string) => void
  onVaciar: () => void
  puedeCrear: boolean
  puedeCobrar: boolean
  faltaMesa: boolean
  mesaPorLimpiar: boolean
  puedeEnviar: boolean
  puedeCobrarAhora: boolean
  enviandoComanda: boolean
  onEnviarCocina: () => void
  onCobrar: () => void
  className?: string
}) {
  const etiquetaCobro =
    items.length > 0
      ? `Cobrar${totales.total > 0 ? ` ${formatearCentimos(totales.total)}` : ""}`
      : pedidosMesa.length > 0
        ? `Cobrar ${formatearCentimos(saldoMesaCentimos)}`
        : "Cobrar"

  return (
    <aside className={cn(panelClass, "flex h-full min-h-0 flex-col gap-3 p-4 lg:p-5", className)} aria-label="Ticket de venta y comanda">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-stone-100">Comanda actual</h2>
          <p className="text-xs text-slate-500 dark:text-stone-400">
            {totales.unidades} {totales.unidades === 1 ? "producto" : "productos"}
          </p>
        </div>
        {items.length > 0 && (
          <button
            id="pos-vaciar-ticket"
            type="button"
            onClick={onVaciar}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
          >
            <Trash2 className="size-3.5" /> Vaciar
          </button>
        )}
      </div>

      {/* Todo lo que se arma (tipo, cliente, mesa e items) se desplaza junto; el total y las acciones quedan siempre visibles */}
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 no-scrollbar">
      {/* Tipo de pedido: Mesa o Llevar */}
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de pedido">
          {TIPOS_ATENCION.map((tipo) => {
            const Icono = tipo === "salon" ? Utensils : ShoppingBag
            const activo = tipoPedido === tipo
            return (
              <button
                key={tipo}
                id={`pos-tipo-${tipo}`}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => onTipoPedidoChange(tipo)}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full border text-xs font-semibold transition-colors cursor-pointer",
                  opcionClass(activo),
                )}
              >
                <Icono className="size-4" />
                {TIPO_ATENCION_LABELS[tipo]}
              </button>
            )
          })}
        </div>

        {/* Cliente (opcional, sirve para llamarlo cuando el pedido esté listo) y mesa, en la misma fila: primero el cliente */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <FloatingInput
                id="pos-cliente"
                label="Cliente (opcional)"
                value={nombreCliente}
                onChange={(e) => onNombreClienteChange(e.target.value)}
                maxLength={100}
                autoComplete="off"
              />
            </div>

            {/* Selección de mesa (el mapa de mesas está en la pestaña de arriba) */}
            {tipoPedido === "salon" && (
              <div className="min-w-0 flex-1">
                <FloatingSelect
                  id="pos-mesa"
                  label="Mesa"
                  value={mesaSeleccionada?.id_mesa ?? null}
                  onValueChange={(valor) => onMesaChange(String(valor ?? ""))}
                  items={mesas.map((m) => ({ value: m.id_mesa, label: `Mesa ${m.numero} · ${ESTADO_MESA_CONFIG[m.estado].label}` }))}
                >
                  {/* El campo es angosto (comparte fila con el cliente): la lista se ensancha para mostrar el estado de cada mesa */}
                  <SelectContent align="end" className="w-auto min-w-56">
                    {mesas.map((m) => (
                      <SelectItem key={m.id_mesa} value={m.id_mesa} disabled={m.estado === "por_limpiar"}>
                        Mesa {m.numero} · {ESTADO_MESA_CONFIG[m.estado].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </FloatingSelect>
              </div>
            )}
          </div>

          {tipoPedido === "salon" && mesaSeleccionada && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 dark:text-stone-400">
                Área: <strong>{areaDeMesa(mesaSeleccionada)}</strong> · {mesaSeleccionada.capacidad} personas
              </span>
              <span className={cn("rounded-full px-2 py-0.2 text-[10px] font-semibold", ESTADO_MESA_CONFIG[mesaSeleccionada.estado].badge)}>
                {ESTADO_MESA_CONFIG[mesaSeleccionada.estado].label}
              </span>
            </div>
          )}

          {/* Pedidos de la mesa que siguen abiertos (se cobran desde aquí) */}
          {tipoPedido === "salon" && pedidosMesa.length > 0 && (
            <ul className="flex flex-col gap-1 border-t border-slate-100 pt-2 text-xs dark:border-stone-800">
              {pedidosMesa.map((p) => (
                <li key={p.id_pedido} className="flex items-center justify-between gap-2">
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-stone-200">
                    #{p.correlativo}
                  </span>
                  <span className="text-slate-500 dark:text-stone-400">{p.estado === "en_preparacion" ? "preparando" : p.estado}</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-stone-100">
                    {formatearDinero(p.saldo_pendiente)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Items de la Comanda con modificadores y notas */}
        <div className="min-h-[96px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-center dark:border-stone-700">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-stone-200">
                <ReceiptText className="size-5" />
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-stone-200">Comanda vacía</p>
              <p className="max-w-[220px] text-xs text-slate-500 dark:text-stone-400">Agrega productos del catálogo para armar la orden.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-stone-800">
              {items.map((item) => (
                <TicketItem
                  key={item.uid}
                  item={item}
                  agotado={productosAgotados.has(item.producto.id_producto)}
                  onCambiarCantidad={onCambiarCantidad}
                  onQuitar={onQuitar}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Totales calculados en tiempo real (los precios ya incluyen IGV) */}
      <div className="flex shrink-0 flex-col gap-1.5 border-t border-slate-200 pt-3 text-sm dark:border-stone-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-stone-400">Subtotal base</span>
          <span className="font-medium tabular-nums text-slate-900 dark:text-stone-100">{formatearCentimos(totales.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-stone-400">IGV (18%)</span>
          <span className="font-medium tabular-nums text-slate-900 dark:text-stone-100">{formatearCentimos(totales.igv)}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-slate-900 dark:text-stone-100">Total comanda</span>
          <span className="text-2xl font-bold tabular-nums text-[#4C0107] dark:text-[#E7B7BC]">{formatearCentimos(totales.total)}</span>
        </div>
      </div>

      {/* Acciones principales: Enviar a cocina y Cobrar en caja (mismo tamaño; sin permiso de cobro queda solo la primera) */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className={cn("grid gap-2", puedeCobrar ? "grid-cols-2" : "grid-cols-1")}>
          <Button
            id="pos-enviar-cocina"
            type="button"
            onClick={onEnviarCocina}
            loading={enviandoComanda}
            disabled={!puedeEnviar}
            size="md"
            className="h-11 min-w-0 justify-center px-3 text-xs font-bold sm:text-sm"
            leftIcon={<ChefHat className="size-4 shrink-0" />}
          >
            <span className="truncate">Enviar a cocina</span>
          </Button>

          {/* Cobro en caja: solo cargos con permiso de cobro */}
          {puedeCobrar && (
            <Button
              id="pos-cobrar"
              type="button"
              onClick={onCobrar}
              disabled={!puedeCobrarAhora || enviandoComanda}
              variant="outline"
              size="md"
              className="h-11 min-w-0 justify-center px-3 text-xs font-bold sm:text-sm"
              leftIcon={<ReceiptText className="size-4 shrink-0" />}
              title={etiquetaCobro}
            >
              <span className="truncate">{etiquetaCobro}</span>
            </Button>
          )}
        </div>

        {!puedeCrear ? (
          <p className="text-center text-xs text-slate-500 dark:text-stone-400">Tu cargo no tiene permiso para tomar pedidos.</p>
        ) : mesaPorLimpiar ? (
          <p className="text-center text-xs font-medium text-sky-700 dark:text-sky-400">
            Esa mesa está por limpiar: márcala como lista en el mapa de mesas.
          </p>
        ) : (
          items.length > 0 &&
          faltaMesa && (
            <p className="text-center text-xs font-medium text-amber-700 dark:text-amber-400">Selecciona una mesa física para continuar.</p>
          )
        )}
      </div>
    </aside>
  )
}
