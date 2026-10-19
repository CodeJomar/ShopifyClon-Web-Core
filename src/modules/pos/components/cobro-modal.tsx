"use client"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import type { CobroResultadoDto } from "@/dtos/caja"
import { METODOS_PAGO } from "@/dtos/caja"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { aCentimos, desdeCentimos, dineroDesdeTexto, formatearCentimos, formatearDinero, repartirCentimos } from "@/shared/utils/dinero"
import { MAX_LINEAS_PAGO, METODO_PAGO_LABELS } from "../schema"
import { type LineaPago, type PedidoACobrar, nuevaLinea } from "./cobro-tipos"
import { useCobro } from "../hooks/use-cobro"
import { ModalMarco, etiquetaCampo } from "./modal-marco"
import { PieModal } from "./pie-modal"
import { ResultadoCobro } from "./resultado-cobro"
import { opcionClass } from "./estilos"
import { BILLETES_SUGERIDOS, METODO_PAGO_ICONS } from "./config-metodos-pago"

interface CobroModalProps {
  pedidos: PedidoACobrar[]
  onClose: () => void
  /** Se llama al cerrar si se registró al menos un pago, para refrescar mesas y pedidos. */
  onCobrado: (resultado: CobroResultadoDto) => void
}

/**
 * Cobro de un pedido. Admite pago mixto (varias líneas con distinto método) y pago parcial (cada comensal paga lo
 * suyo): el pedido queda pagado cuando lo cobrado cubre su total. El monto lo valida la API contra el saldo.
 */
export function CobroModal({ pedidos, onClose, onCobrado }: CobroModalProps) {
  const [idPedido, setIdPedido] = React.useState(pedidos[0]?.id_pedido ?? "")
  const pedido = pedidos.find((p) => p.id_pedido === idPedido) ?? pedidos[0]
  const saldoInicial = pedido ? aCentimos(pedido.saldo_pendiente) : 0
  // Saldo vigente: el de la lista al abrir y, tras cada pago, el que informa la API.
  const [saldoBase, setSaldoBase] = React.useState(saldoInicial)

  const [lineas, setLineas] = React.useState<LineaPago[]>(() => [nuevaLinea(desdeCentimos(saldoInicial))])
  const [resultado, setResultado] = React.useState<CobroResultadoDto | null>(null)
  const [mensaje, setMensaje] = React.useState<string | null>(null)
  const { cobrar, isSubmitting } = useCobro()

  const saldo = saldoBase
  const total = pedido ? aCentimos(pedido.total) : 0

  const montos = lineas.map((l) => dineroDesdeTexto(l.monto))
  const aplicado = montos.reduce((suma, m) => suma + (m ? aCentimos(m) : 0), 0)
  const restante = saldo - aplicado

  const cambiarLinea = (id: string, cambios: Partial<LineaPago>) => {
    setLineas((prev) => prev.map((l) => (l.id === id ? { ...l, ...cambios } : l)))
    setMensaje(null)
  }

  const reiniciarLineas = (saldoCentimos: number) => {
    setLineas([nuevaLinea(desdeCentimos(saldoCentimos))])
    setMensaje(null)
  }

  const cambiarPedido = (id: string) => {
    const siguiente = pedidos.find((p) => p.id_pedido === id)
    setIdPedido(id)
    if (siguiente) {
      setSaldoBase(aCentimos(siguiente.saldo_pendiente))
      reiniciarLineas(aCentimos(siguiente.saldo_pendiente))
    }
  }

  const validar = (): string | null => {
    if (lineas.some((l) => !dineroDesdeTexto(l.monto) || aCentimos(dineroDesdeTexto(l.monto)) <= 0)) {
      return "Cada pago necesita un monto mayor a cero (ej: 12.50)."
    }
    if (aplicado > saldo) return `Lo cobrado (${formatearCentimos(aplicado)}) supera el saldo (${formatearCentimos(saldo)}).`
    return null
  }

  const confirmar = async () => {
    if (!pedido) return
    const error = validar()
    if (error) return setMensaje(error)

    const respuesta = await cobrar(
      pedido.id_pedido,
      lineas.map((l) => ({ metodo_pago: l.metodo, monto: dineroDesdeTexto(l.monto) as string })),
    )
    if (!respuesta) return // el toast ya explicó el motivo (caja cerrada, saldo, permisos...)
    setResultado(respuesta)
    setSaldoBase(aCentimos(respuesta.saldo_pendiente))
    setMensaje(null)
  }

  const cerrar = () => {
    if (resultado) onCobrado(resultado)
    onClose()
  }

  const registrarOtroPago = () => {
    if (!resultado) return
    setResultado(null)
    // El saldo ya descontó lo pagado: se parte de él.
    setLineas([nuevaLinea(desdeCentimos(saldoBase))])
  }

  if (!pedido) return null

  // Si ya se pagó algo, el saldo del selector es el de la respuesta.
  const completo = resultado?.estado_pago === "pagado"

  return (
    <ModalMarco
      titulo={completo ? "Pedido pagado" : resultado ? "Pago registrado" : "Cobrar pedido"}
      subtitulo={pedido.etiqueta}
      onClose={cerrar}
      cerrarDeshabilitado={isSubmitting}
      ancho={resultado ? "max-w-md" : "max-w-5xl"}
    >
      {resultado ? (
        <ResultadoCobro resultado={resultado} completo={completo} onOtroPago={registrarOtroPago} onCerrar={cerrar} />
      ) : (
        <>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
            {/* Resumen: qué se cobra, cómo dividir la cuenta y cuánto se cobra ahora */}
            <div className="flex flex-col gap-4">
            {pedidos.length > 1 && (
              <FloatingSelect
                id="pos-pedido-cobro"
                label="Pedido a cobrar"
                value={pedido.id_pedido}
                onValueChange={(valor) => cambiarPedido(String(valor ?? ""))}
                items={pedidos.map((p) => ({ value: p.id_pedido, label: `${p.etiqueta} · saldo ${formatearDinero(p.saldo_pendiente)}` }))}
              >
                <SelectContent>
                  {pedidos.map((p) => (
                    <SelectItem key={p.id_pedido} value={p.id_pedido}>
                      {p.etiqueta} · saldo {formatearDinero(p.saldo_pendiente)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </FloatingSelect>
            )}

            {/* Total y saldo */}
            <div className="flex items-center justify-between rounded-2xl bg-[#4C0107] p-4 text-white dark:bg-stone-800">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white/80 dark:text-stone-300">Saldo por cobrar</span>
                {saldo < total && (
                  <span className="text-[11px] text-white/70 dark:text-stone-400">
                    Total {formatearCentimos(total)} · ya pagado {formatearCentimos(total - saldo)}
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold tabular-nums dark:text-stone-100">{formatearCentimos(saldo)}</span>
            </div>

            {/* Atajos para dividir la cuenta entre comensales */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={etiquetaCampo}>Pagar una parte</span>
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLineas([nuevaLinea(desdeCentimos(repartirCentimos(saldo, n)[0]))])}
                  className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer", opcionClass(false))}
                >
                  1/{n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => reiniciarLineas(saldo)}
                className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer", opcionClass(false))}
              >
                Todo
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-stone-800">
              <span className="text-slate-600 dark:text-stone-300">Se cobra ahora</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-stone-100">{formatearCentimos(aplicado)}</span>
            </div>
            {aplicado > 0 && aplicado < saldo && (
              <p className="text-xs text-slate-500 dark:text-stone-400">
                Quedarán {formatearCentimos(restante)} por cobrar: el pedido seguirá abierto hasta cubrir el total.
              </p>
            )}

            {mensaje && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
              >
                {mensaje}
              </p>
            )}
            </div>

            {/* Pagos: cada línea con su método y monto (pago mixto) */}
            <div className="flex min-h-0 flex-col gap-4">
            {/* Líneas de pago: cada una con su método y monto (pago mixto) */}
            <div className="flex flex-col gap-3">
              {lineas.map((linea, indice) => {
                const monto = montos[indice]
                const vuelto =
                  linea.metodo === "efectivo" && dineroDesdeTexto(linea.recibido) && monto
                    ? Math.max(aCentimos(dineroDesdeTexto(linea.recibido)) - aCentimos(monto), 0)
                    : null
                return (
                  <div
                    key={linea.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-stone-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className={etiquetaCampo}>Pago {lineas.length > 1 ? indice + 1 : ""}</span>
                      {lineas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setLineas((prev) => prev.filter((l) => l.id !== linea.id))}
                          aria-label="Quitar este pago"
                          className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {METODOS_PAGO.map((metodo) => {
                        const Icono = METODO_PAGO_ICONS[metodo]
                        const activo = linea.metodo === metodo
                        return (
                          <button
                            key={metodo}
                            type="button"
                            aria-pressed={activo}
                            onClick={() => cambiarLinea(linea.id, { metodo })}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] font-semibold transition-colors cursor-pointer",
                              opcionClass(activo),
                            )}
                          >
                            <Icono className="size-4" />
                            {METODO_PAGO_LABELS[metodo]}
                          </button>
                        )
                      })}
                    </div>

                    <FloatingInput
                      id={`pos-monto-${linea.id}`}
                      label="Monto a cobrar"
                      leftIcon={<span className="text-sm font-semibold">S/</span>}
                      inputMode="decimal"
                      value={linea.monto}
                      onChange={(e) => cambiarLinea(linea.id, { monto: e.target.value })}
                      autoComplete="off"
                      className="[&_input]:tabular-nums"
                    />

                    {linea.metodo === "efectivo" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {BILLETES_SUGERIDOS.filter((b) => !monto || b * 100 >= aCentimos(monto)).map((billete) => (
                            <button
                              key={billete}
                              type="button"
                              onClick={() => cambiarLinea(linea.id, { recibido: String(billete) })}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition-colors cursor-pointer",
                                opcionClass(aCentimos(dineroDesdeTexto(linea.recibido)) === billete * 100),
                              )}
                            >
                              S/ {billete}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <FloatingInput
                            id={`pos-recibido-${linea.id}`}
                            label="Efectivo recibido"
                            leftIcon={<span className="text-sm font-semibold">S/</span>}
                            inputMode="decimal"
                            value={linea.recibido}
                            onChange={(e) => cambiarLinea(linea.id, { recibido: e.target.value })}
                            autoComplete="off"
                            className="flex-1 [&_input]:tabular-nums"
                          />
                          <div className="flex h-14 items-center gap-2 rounded-2xl bg-slate-100 px-3 text-sm dark:bg-stone-800">
                            <span className="text-slate-600 dark:text-stone-300">Vuelto</span>
                            <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                              {formatearCentimos(vuelto ?? 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {lineas.length < MAX_LINEAS_PAGO && restante > 0 && (
                <button
                  type="button"
                  onClick={() => setLineas((prev) => [...prev, nuevaLinea(desdeCentimos(restante), "tarjeta")])}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-600 transition-colors hover:border-[#4C0107]/40 hover:text-[#4C0107] dark:border-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  <Plus className="size-4" /> Agregar otro método de pago ({formatearCentimos(restante)} restante)
                </button>
              )}
            </div>

            </div>
          </div>

          <PieModal>
            <Button type="button" variant="neutral" size="md" onClick={cerrar} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button id="pos-confirmar-cobro" type="button" size="md" loading={isSubmitting} onClick={() => void confirmar()}>
              Confirmar {formatearCentimos(aplicado)}
            </Button>
          </PieModal>
        </>
      )}
    </ModalMarco>
  )
}
