"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import type { EnvioOrden, OrdenDetallePanel, PagoOrden } from "@/dtos/ordenes"
import type { ErrorApi } from "@/lib/api/error-api"
import {
  despacharEnvioAction,
  entregarEnvioAction,
  devolverEnvioAction,
  envioOrdenAction,
  ordenAction,
  pagosOrdenAction,
} from "../actions/ordenes.actions"
import { CancelarForm, EnvioForm, PagoManualForm, ReembolsoForm, type Resultado } from "../components/formularios-orden"
import { ETIQUETA_ENVIO, ETIQUETA_ESTADO, ETIQUETA_PAGO, ETIQUETA_PREPARACION } from "../etiquetas"

type Panel = "pago" | "crear-envio" | "editar-envio" | "cancelar" | "reembolso"

const TITULO_PANEL: Record<Panel, string> = {
  pago: "Registrar pago manual",
  "crear-envio": "Preparar envío",
  "editar-envio": "Editar envío",
  cancelar: "Cancelar orden",
  reembolso: "Reembolsar",
}

/** Detalle de una orden del panel. Muestra solo las acciones que corresponden al estado y al permiso; la API decide igual. */
export function OrdenDetalleView({ ordenId }: { ordenId: string }) {
  const { tienda, puede } = usePanel()
  const confirmar = useConfirm()
  const puedeGestionar = puede(PERMISO.ORDENES_GESTIONAR)
  const puedeCancelar = puede(PERMISO.ORDENES_CANCELAR)
  const puedeReembolsar = puede(PERMISO.REEMBOLSOS_EMITIR)
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"

  const [orden, setOrden] = React.useState<OrdenDetallePanel | null>(null)
  const [pagos, setPagos] = React.useState<PagoOrden[]>([])
  const [envio, setEnvio] = React.useState<EnvioOrden | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [enCurso, setEnCurso] = React.useState(false)
  const [panel, setPanel] = React.useState<Panel | null>(null)
  const [errorPanel, setErrorPanel] = React.useState<ErrorApi | null>(null)

  const cargar = React.useCallback(async () => {
    const [o, p, e] = await Promise.all([ordenAction(ordenId), pagosOrdenAction(ordenId), envioOrdenAction(ordenId)])
    if (!o.ok) return setError(o.error)
    setError(null)
    setOrden(o.datos)
    setPagos(p.ok ? p.datos : [])
    // 404 = la orden aún no tiene envío.
    setEnvio(e.ok ? e.datos : null)
  }, [ordenId])

  React.useEffect(() => {
    let cancelado = false
    Promise.all([ordenAction(ordenId), pagosOrdenAction(ordenId), envioOrdenAction(ordenId)]).then(([o, p, e]) => {
      if (cancelado) return
      if (!o.ok) return setError(o.error)
      setError(null)
      setOrden(o.datos)
      setPagos(p.ok ? p.datos : [])
      setEnvio(e.ok ? e.datos : null)
    })
    return () => {
      cancelado = true
    }
  }, [ordenId])

  /** Ejecuta una acción de la API: muestra el mensaje y recarga la orden. */
  const ejecutar = async (accion: () => Promise<{ ok: boolean; error?: ErrorApi }>, exito: string) => {
    setEnCurso(true)
    setError(null)
    const res = await accion()
    setEnCurso(false)
    if (!res.ok && res.error) return setError(res.error)
    toast.add({ type: "success", title: exito })
    await cargar()
  }

  const terminarPanel = async (resultado: Resultado) => {
    if (resultado.error) return setErrorPanel(resultado.error)
    setErrorPanel(null)
    setPanel(null)
    toast.add({ type: "success", title: "Cambios guardados" })
    await cargar()
  }

  if (error && !orden) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No encontramos esta orden</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }
  if (!orden) return <p className="text-[13px] text-muted-foreground">Cargando la orden…</p>

  const moneda = orden.moneda
  const pagada = orden.estado_pago === "PAGADO" || orden.estado_pago === "PARCIALMENTE_REEMBOLSADO"
  const abierta = orden.estado === "ABIERTA"

  // Acciones visibles según estado y permiso (la API valida igual).
  const mostrar = {
    pago: puedeGestionar && orden.estado_pago === "PENDIENTE" && orden.estado !== "CANCELADA",
    crearEnvio: puedeGestionar && orden.estado_pago === "PAGADO" && !envio && orden.estado === "ABIERTA",
    editarEnvio: puedeGestionar && !!envio && (envio.estado === "CREADO" || envio.estado === "EN_TRANSITO"),
    despachar: puedeGestionar && envio?.estado === "CREADO",
    entregar: puedeGestionar && envio?.estado === "EN_TRANSITO",
    devolver: puedeGestionar && envio?.estado === "EN_TRANSITO",
    cancelar: puedeCancelar && abierta && orden.estado_preparacion === "NO_PREPARADO",
    reembolsar: puedeReembolsar && pagada,
  }

  const despachar = async () => {
    if (!envio) return
    const ok = await confirmar({ title: "¿Despachar el envío?", description: "El envío pasará a En tránsito." })
    if (ok) await ejecutar(() => despacharEnvioAction(envio.id), "Envío despachado")
  }
  const entregar = async () => {
    if (!envio) return
    const ok = await confirmar({ title: "¿Marcar como entregada?", description: "La orden quedará como entregada." })
    if (ok) await ejecutar(() => entregarEnvioAction(envio.id), "Orden entregada")
  }
  const devolver = async () => {
    if (!envio) return
    const ok = await confirmar({ variant: "destructive", title: "¿Marcar el envío como devuelto?", description: "Revisa el estado después de confirmar." })
    if (ok) await ejecutar(() => devolverEnvioAction(envio.id), "Envío marcado como devuelto")
  }

  const abrir = (p: Panel) => {
    setErrorPanel(null)
    setPanel(p)
  }

  // Cancelar y reembolsar son irreversibles: se confirma antes de enviar el formulario.
  const guardarPanel = async () => {
    if (!panel) return
    if (panel === "cancelar" || panel === "reembolso") {
      const ok = await confirmar({
        variant: "destructive",
        title: panel === "cancelar" ? "¿Cancelar esta orden?" : "¿Emitir el reembolso?",
        description: "Esta acción no se puede deshacer.",
      })
      if (!ok) return
    }
    document.querySelector<HTMLFormElement>(`form#form-${panel}`)?.requestSubmit()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Link href="/panel/ordenes" className="text-[12px] font-bold text-brand-text hover:underline">← Órdenes</Link>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">{orden.numero_orden}</h1>
          <p className="text-[12px] text-muted-foreground">Hecha el {formatearFecha(orden.fecha_creacion, zonaHoraria)}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="estado" tono={ETIQUETA_ESTADO[orden.estado].tono}>{ETIQUETA_ESTADO[orden.estado].texto}</Badge>
            <Badge variant="estado" tono={ETIQUETA_PAGO[orden.estado_pago].tono}>{ETIQUETA_PAGO[orden.estado_pago].texto}</Badge>
            <Badge variant="estado" tono={ETIQUETA_PREPARACION[orden.estado_preparacion].tono}>{ETIQUETA_PREPARACION[orden.estado_preparacion].texto}</Badge>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {mostrar.pago && <Button type="button" disabled={enCurso} onClick={() => abrir("pago")}>Registrar pago manual</Button>}
          {mostrar.crearEnvio && <Button type="button" disabled={enCurso} onClick={() => abrir("crear-envio")}>Preparar envío</Button>}
          {mostrar.editarEnvio && <Button type="button" variant="neutral" disabled={enCurso} onClick={() => abrir("editar-envio")}>Editar envío</Button>}
          {mostrar.despachar && <Button type="button" disabled={enCurso} onClick={despachar}>Despachar</Button>}
          {mostrar.entregar && <Button type="button" disabled={enCurso} onClick={entregar}>Marcar entregada</Button>}
          {mostrar.devolver && <Button type="button" variant="danger-outline" disabled={enCurso} onClick={devolver}>Marcar devuelta</Button>}
          {mostrar.cancelar && <Button type="button" variant="danger-outline" disabled={enCurso} onClick={() => abrir("cancelar")}>Cancelar orden</Button>}
          {mostrar.reembolsar && <Button type="button" variant="neutral" disabled={enCurso} onClick={() => abrir("reembolso")}>Reembolsar</Button>}
          {!Object.values(mostrar).some(Boolean) && <p className="text-[13px] text-muted-foreground">No hay acciones disponibles para esta orden.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Líneas y totales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border text-[13px]">
            {orden.items.map((i, idx) => (
              <li key={`${i.sku ?? i.titulo_producto}-${idx}`} className="flex justify-between gap-3 py-2">
                <span>{i.titulo_producto} · {i.titulo_variante} × {i.cantidad}</span>
                <span>{formatearDinero(i.total_linea, moneda)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 text-[13px]">
            <Fila etiqueta="Subtotal" valor={formatearDinero(orden.subtotal, moneda)} />
            {Number(orden.descuento_total) > 0 && <Fila etiqueta={`Descuento${orden.codigo_cupon ? ` (${orden.codigo_cupon})` : ""}`} valor={`−${formatearDinero(orden.descuento_total, moneda)}`} />}
            <Fila etiqueta={`Envío${orden.nombre_tarifa_envio ? ` (${orden.nombre_tarifa_envio})` : ""}`} valor={formatearDinero(orden.costo_envio, moneda)} />
            <Fila etiqueta="Impuestos" valor={formatearDinero(orden.impuestos_total, moneda)} />
            <div className="flex justify-between border-t border-border pt-2 text-[15px] font-extrabold">
              <dt>Total</dt>
              <dd>{formatearDinero(orden.total, moneda)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-[13px]">
          <p>{orden.nombre_cliente}</p>
          <p className="text-muted-foreground">{orden.correo_cliente}{orden.telefono_cliente ? ` · ${orden.telefono_cliente}` : ""}</p>
          {orden.direccion_envio && <p className="text-muted-foreground">Envío: {direccionTexto(orden.direccion_envio)}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {pagos.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Esta orden aún no tiene pagos registrados.</p>
          ) : (
            <ul className="divide-y divide-border text-[13px]">
              {pagos.map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>{p.tipo === "CARGO" ? "Cobro" : "Reembolso"} · {p.estado === "APROBADO" ? "Aprobado" : p.estado === "RECHAZADO" ? "Rechazado" : "Pendiente"}{p.referencia ? ` · ${p.referencia}` : ""}</span>
                  <span>{formatearDinero(p.monto, p.moneda)} · {formatearFecha(p.fecha_creacion, zonaHoraria)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {envio && (
        <Card>
          <CardHeader>
            <CardTitle>Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-[13px]">
            <p>Estado: <span className="font-bold">{ETIQUETA_ENVIO[envio.estado]}</span></p>
            {envio.empresa_transporte && <p>Transportista: {envio.empresa_transporte}</p>}
            {envio.numero_guia && <p>Guía: {envio.numero_guia}</p>}
            {envio.url_seguimiento && (
              <p>
                Seguimiento: <a className="font-bold text-brand-text hover:underline" href={envio.url_seguimiento} target="_blank" rel="noreferrer">abrir enlace</a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <FormPanel
        open={panel !== null}
        onOpenChange={(abierto) => !abierto && setPanel(null)}
        title={panel ? TITULO_PANEL[panel] : ""}
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setPanel(null)}>Cancelar</Button>
            <Button type="button" disabled={enCurso} onClick={guardarPanel}>Guardar</Button>
          </>
        }
      >
        {errorPanel && (
          <Alert variant="destructive">
            <AlertDescription>{errorPanel.message}</AlertDescription>
          </Alert>
        )}
        {panel === "pago" && <PagoManualForm formId="form-pago" ordenId={ordenId} onTerminar={terminarPanel} />}
        {panel === "crear-envio" && <EnvioForm formId="form-crear-envio" ordenId={ordenId} envio={null} onTerminar={terminarPanel} />}
        {panel === "editar-envio" && <EnvioForm formId="form-editar-envio" ordenId={ordenId} envio={envio} onTerminar={terminarPanel} />}
        {panel === "cancelar" && <CancelarForm formId="form-cancelar" ordenId={ordenId} onTerminar={terminarPanel} />}
        {panel === "reembolso" && <ReembolsoForm formId="form-reembolso" ordenId={ordenId} onTerminar={terminarPanel} />}
      </FormPanel>
    </div>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  )
}

function direccionTexto(d: Record<string, unknown>): string {
  return ["direccion_linea1", "ciudad", "estado_provincia", "pais"]
    .map((k) => d[k])
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(", ")
}
