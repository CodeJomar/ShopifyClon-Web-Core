"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import type { EnvioOrden, MotivoCancelacion } from "@/dtos/ordenes"
import type { ErrorApi } from "@/lib/api/error-api"
import {
  cancelarOrdenAction,
  crearEnvioAction,
  editarEnvioAction,
  registrarPagoManualAction,
  reembolsarOrdenAction,
} from "../actions/ordenes.actions"

/** Resultado de un formulario: el error de la API (si lo hay) o `null` si salió bien. */
export type Resultado = { error: ErrorApi | null }

interface FormularioProps {
  formId: string
  /** Se llama al terminar; con error la pantalla lo muestra y el formulario sigue abierto. */
  onTerminar: (resultado: Resultado) => void
}

const LIMITE_MOTIVO = 255

function AvisoError({ error, titulo }: { error: string | null; titulo: string }) {
  if (!error) return null
  return (
    <Alert variant="destructive">
      <AlertTitle>{titulo}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

/** Registra el pago manual por el total de la orden (PAG-004). La web no envía monto: lo fija la API. */
export function PagoManualForm({ formId, ordenId, onTerminar }: FormularioProps & { ordenId: string }) {
  const [referencia, setReferencia] = React.useState("")
  const [mensaje, setMensaje] = React.useState<string | null>(null)
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje(null)
    if (referencia.length > 100) return setMensaje("La referencia no puede pasar de 100 caracteres.")
    const res = await registrarPagoManualAction(ordenId, referencia.trim() || undefined)
    onTerminar({ error: res.ok ? null : res.error })
  }
  return (
    <form id={formId} onSubmit={enviar} noValidate className="space-y-5">
      <AvisoError error={mensaje} titulo="Revisa el formulario" />
      <FloatingInput label="Referencia del pago (opcional)" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
    </form>
  )
}

interface DatosEnvio {
  empresa_transporte: string
  numero_guia: string
  url_seguimiento: string
  fecha_entrega_estimada: string
}

/** Validación de envío: la URL de seguimiento debe ser https y los campos tienen límite (ENV-003/006). */
function validarEnvio(d: DatosEnvio): string | null {
  if (d.empresa_transporte.length > 100) return "La empresa de transporte no puede pasar de 100 caracteres."
  if (d.numero_guia.length > 100) return "El número de guía no puede pasar de 100 caracteres."
  if (d.url_seguimiento && !/^https:\/\/.+/.test(d.url_seguimiento)) return "La URL de seguimiento debe empezar por https://."
  if (d.url_seguimiento.length > 2000) return "La URL de seguimiento no puede pasar de 2000 caracteres."
  return null
}

function cuerpoEnvio(d: DatosEnvio) {
  return {
    empresa_transporte: d.empresa_transporte.trim() || undefined,
    numero_guia: d.numero_guia.trim() || undefined,
    url_seguimiento: d.url_seguimiento.trim() || undefined,
    fecha_entrega_estimada: d.fecha_entrega_estimada ? `${d.fecha_entrega_estimada}T12:00:00-05:00` : undefined,
  }
}

/** Crear el envío (preparar la orden) o editarlo mientras no esté entregado. */
export function EnvioForm({
  formId,
  ordenId,
  envio,
  onTerminar,
}: FormularioProps & { ordenId: string; envio: EnvioOrden | null }) {
  const [datos, setDatos] = React.useState<DatosEnvio>({
    empresa_transporte: envio?.empresa_transporte ?? "",
    numero_guia: envio?.numero_guia ?? "",
    url_seguimiento: envio?.url_seguimiento ?? "",
    fecha_entrega_estimada: envio?.fecha_entrega_estimada ? envio.fecha_entrega_estimada.slice(0, 10) : "",
  })
  const [mensaje, setMensaje] = React.useState<string | null>(null)
  const set = (campo: keyof DatosEnvio) => (e: React.ChangeEvent<HTMLInputElement>) => setDatos((d) => ({ ...d, [campo]: e.target.value }))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje(validarEnvio(datos))
    if (validarEnvio(datos)) return
    const res = envio ? await editarEnvioAction(envio.id, cuerpoEnvio(datos)) : await crearEnvioAction(ordenId, cuerpoEnvio(datos))
    onTerminar({ error: res.ok ? null : res.error })
  }

  return (
    <form id={formId} onSubmit={enviar} noValidate className="space-y-5">
      <AvisoError error={mensaje} titulo="Revisa el formulario" />
      <FloatingInput label="Empresa de transporte (opcional)" value={datos.empresa_transporte} onChange={set("empresa_transporte")} />
      <FloatingInput label="Número de guía (opcional)" value={datos.numero_guia} onChange={set("numero_guia")} />
      <FloatingInput label="URL de seguimiento (https, opcional)" value={datos.url_seguimiento} onChange={set("url_seguimiento")} />
      <label className="block space-y-1.5 text-[13px]">
        <span className="font-bold">Entrega estimada (opcional)</span>
        <input type="date" className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]" value={datos.fecha_entrega_estimada} onChange={set("fecha_entrega_estimada")} />
      </label>
    </form>
  )
}

/** Cancelar la orden con motivo. Con "OTRO" el detalle es obligatorio. `reponer_stock` devuelve el stock reservado (INV-006). */
export function CancelarForm({ formId, ordenId, onTerminar }: FormularioProps & { ordenId: string }) {
  const [motivo, setMotivo] = React.useState<MotivoCancelacion>("CLIENTE")
  const [detalle, setDetalle] = React.useState("")
  const [reponer, setReponer] = React.useState(true)
  const [mensaje, setMensaje] = React.useState<string | null>(null)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (motivo === "OTRO" && !detalle.trim()) return setMensaje("Explica el motivo en el detalle.")
    if (detalle.length > LIMITE_MOTIVO) return setMensaje("El detalle no puede pasar de 255 caracteres.")
    setMensaje(null)
    const res = await cancelarOrdenAction(ordenId, {
      motivo,
      detalle: detalle.trim() || undefined,
      reponer_stock: reponer,
    })
    onTerminar({ error: res.ok ? null : res.error })
  }

  return (
    <form id={formId} onSubmit={enviar} noValidate className="space-y-5">
      <AvisoError error={mensaje} titulo="Revisa el formulario" />
      <label className="block space-y-1.5 text-[13px]">
        <span className="font-bold">Motivo</span>
        <select className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]" value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoCancelacion)}>
          <option value="CLIENTE">El cliente lo pidió</option>
          <option value="FRAUDE">Fraude</option>
          <option value="SIN_STOCK">Sin stock</option>
          <option value="OTRO">Otro</option>
        </select>
      </label>
      <FloatingInput label={motivo === "OTRO" ? "Detalle (obligatorio)" : "Detalle (opcional)"} value={detalle} onChange={(e) => setDetalle(e.target.value)} />
      <label className="flex items-center gap-3 text-[13px]">
        <input type="checkbox" checked={reponer} onChange={(e) => setReponer(e.target.checked)} />
        <span>Devolver el stock reservado a la tienda</span>
      </label>
    </form>
  )
}

/**
 * Reembolso con monto y motivo. La web no calcula el saldo: el monto lo valida la API (PAG-007).
 * El monto lo escribe quien opera; el reembolso total es el mismo monto que muestra la orden.
 */
export function ReembolsoForm({ formId, ordenId, onTerminar }: FormularioProps & { ordenId: string }) {
  const [monto, setMonto] = React.useState("")
  const [motivo, setMotivo] = React.useState("")
  const [mensaje, setMensaje] = React.useState<string | null>(null)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const numero = Number(monto)
    if (!monto.trim() || !Number.isFinite(numero) || numero <= 0) return setMensaje("Escribe un monto mayor que cero.")
    if (motivo.trim().length < 5) return setMensaje("El motivo debe tener al menos 5 caracteres.")
    if (motivo.length > LIMITE_MOTIVO) return setMensaje("El motivo no puede pasar de 255 caracteres.")
    setMensaje(null)
    const res = await reembolsarOrdenAction(ordenId, { monto: numero, motivo: motivo.trim() })
    onTerminar({ error: res.ok ? null : res.error })
  }

  return (
    <form id={formId} onSubmit={enviar} noValidate className="space-y-5">
      <AvisoError error={mensaje} titulo="Revisa el formulario" />
      <FloatingInput label="Monto a reembolsar" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} />
      <FloatingInput label="Motivo del reembolso" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
    </form>
  )
}
