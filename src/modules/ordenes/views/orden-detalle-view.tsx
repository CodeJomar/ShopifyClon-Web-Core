"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ArrowLeft, MapPin, Truck, User } from "lucide-react"
import { ProgresoOrden } from "../components/progreso-orden"
import { VisorUbicacion } from "@/shared/components/composed/mapa-ubicacion"
import { LineaTiempoEnvio } from "@/modules/rutas/components/linea-tiempo-envio"
import { eventosEnvioAction } from "@/modules/rutas/actions/rutas.actions"
import type { EventoEnvio } from "@/dtos/ruta"
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
  const [eventos, setEventos] = React.useState<EventoEnvio[] | null>(null)
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

  // Historial del envío: se vuelve a pedir cuando el envío cambia de estado.
  const envioId = envio?.id
  const envioEstado = envio?.estado
  React.useEffect(() => {
    if (!envioId) return
    let cancelado = false
    eventosEnvioAction(envioId).then((res) => {
      if (!cancelado) setEventos(res.ok ? res.datos : [])
    })
    return () => {
      cancelado = true
    }
  }, [envioId, envioEstado])

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
  if (!orden)
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Cargando la orden">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )

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

  const botonesAccion = (
    <>
      {mostrar.pago && <Button type="button" disabled={enCurso} onClick={() => abrir("pago")}>Registrar pago manual</Button>}
      {mostrar.crearEnvio && <Button type="button" disabled={enCurso} onClick={() => abrir("crear-envio")}>Preparar envío</Button>}
      {mostrar.despachar && <Button type="button" disabled={enCurso} onClick={despachar}>Despachar</Button>}
      {mostrar.entregar && <Button type="button" disabled={enCurso} onClick={entregar}>Marcar entregada</Button>}
      {mostrar.editarEnvio && <Button type="button" variant="neutral" disabled={enCurso} onClick={() => abrir("editar-envio")}>Editar envío</Button>}
      {mostrar.reembolsar && <Button type="button" variant="neutral" disabled={enCurso} onClick={() => abrir("reembolso")}>Reembolsar</Button>}
      {mostrar.devolver && <Button type="button" variant="danger-outline" disabled={enCurso} onClick={devolver}>Marcar devuelta</Button>}
      {mostrar.cancelar && <Button type="button" variant="danger-outline" disabled={enCurso} onClick={() => abrir("cancelar")}>Cancelar orden</Button>}
    </>
  )

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Link href="/panel/ordenes" className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-text hover:underline">
          <ArrowLeft aria-hidden="true" className="size-3.5" /> Órdenes
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="font-mono text-[20px] font-extrabold tracking-tight text-foreground">{orden.numero_orden}</h1>
            <p className="text-[12.5px] text-muted-foreground">Hecha el {formatearFecha(orden.fecha_creacion, zonaHoraria)}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="estado" tono={ETIQUETA_ESTADO[orden.estado].tono}>{ETIQUETA_ESTADO[orden.estado].texto}</Badge>
              <Badge variant="estado" tono={ETIQUETA_PAGO[orden.estado_pago].tono}>{ETIQUETA_PAGO[orden.estado_pago].texto}</Badge>
              <Badge variant="estado" tono={ETIQUETA_PREPARACION[orden.estado_preparacion].tono}>{ETIQUETA_PREPARACION[orden.estado_preparacion].texto}</Badge>
            </div>
          </div>
          {Object.values(mostrar).some(Boolean) && <div className="flex flex-wrap items-center gap-2">{botonesAccion}</div>}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <ProgresoOrden estado={orden.estado} estadoPago={orden.estado_pago} estadoPreparacion={orden.estado_preparacion} estadoEnvio={envio?.estado} />
        </CardContent>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="divide-y divide-border/60 text-[13px]">
                {orden.items.map((i, idx) => (
                  <li key={`${i.sku ?? i.titulo_producto}-${idx}`} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{i.titulo_producto}</p>
                      <p className="text-[12px] text-muted-foreground">{i.titulo_variante} · {i.cantidad} {i.cantidad === 1 ? "unidad" : "unidades"}</p>
                    </div>
                    <span className="shrink-0 font-bold">{formatearDinero(i.total_linea, moneda)}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 rounded-xl bg-muted/40 p-4 text-[13px]">
                <Fila etiqueta="Subtotal" valor={formatearDinero(orden.subtotal, moneda)} />
                {Number(orden.descuento_total) > 0 && <Fila etiqueta={`Descuento${orden.codigo_cupon ? ` (${orden.codigo_cupon})` : ""}`} valor={`−${formatearDinero(orden.descuento_total, moneda)}`} />}
                <Fila etiqueta={`Envío${orden.nombre_tarifa_envio ? ` (${orden.nombre_tarifa_envio})` : ""}`} valor={formatearDinero(orden.costo_envio, moneda)} />
                <Fila etiqueta="Impuestos" valor={formatearDinero(orden.impuestos_total, moneda)} />
                <div className="flex justify-between border-t border-border pt-2 text-[16px] font-extrabold">
                  <dt>Total</dt>
                  <dd>{formatearDinero(orden.total, moneda)}</dd>
                </div>
              </dl>
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
                <ul className="divide-y divide-border/60 text-[13px]">
                  {pagos.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{p.tipo === "CARGO" ? "Cobro" : "Reembolso"}</span>
                        <Badge variant="estado" tono={p.estado === "APROBADO" ? "exito" : p.estado === "RECHAZADO" ? "peligro" : "aviso"}>
                          {p.estado === "APROBADO" ? "Aprobado" : p.estado === "RECHAZADO" ? "Rechazado" : "Pendiente"}
                        </Badge>
                        {p.referencia && <span className="font-mono text-[12px] text-muted-foreground">{p.referencia}</span>}
                      </span>
                      <span className="text-muted-foreground"><span className="font-bold text-foreground">{formatearDinero(p.monto, p.moneda)}</span> · {formatearFecha(p.fecha_creacion, zonaHoraria)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User aria-hidden="true" className="size-4 text-brand-text" />Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-[13px]">
              <p className="font-bold text-foreground">{orden.nombre_cliente}</p>
              <p className="break-all text-muted-foreground">{orden.correo_cliente}</p>
              {orden.telefono_cliente && <p className="text-muted-foreground">{orden.telefono_cliente}</p>}
              {orden.direccion_envio && (
                <p className="flex items-start gap-1.5 pt-2 text-muted-foreground">
                  <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  {direccionTexto(orden.direccion_envio)}
                </p>
              )}
              <VisorUbicacion valor={puntoDe(orden.direccion_envio)} className="mt-2 h-48" />
            </CardContent>
          </Card>

          {envio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck aria-hidden="true" className="size-4 text-brand-text" />Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-[13px]">
                <p className="text-muted-foreground">Estado: <span className="font-bold text-foreground">{ETIQUETA_ENVIO[envio.estado]}</span></p>
                {envio.empresa_transporte && <p className="text-muted-foreground">Transportista: <span className="font-bold text-foreground">{envio.empresa_transporte}</span></p>}
                {envio.numero_guia && <p className="text-muted-foreground">Guía: <span className="font-mono font-bold text-foreground">{envio.numero_guia}</span></p>}
                {envio.url_seguimiento && (
                  <a className="inline-block pt-1 font-bold text-brand-text hover:underline" href={envio.url_seguimiento} target="_blank" rel="noreferrer">
                    Abrir seguimiento →
                  </a>
                )}
                <div className="border-t border-border/60 pt-3">
                  <p className="mb-2 text-[12px] font-bold text-muted-foreground">Historial</p>
                  <LineaTiempoEnvio eventos={eventos} zonaHoraria={zonaHoraria} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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

/** Punto de entrega marcado por el comprador (A-004); las órdenes antiguas no lo tienen. */
function puntoDe(d?: Record<string, unknown> | null): { latitud: number; longitud: number } | null {
  const latitud = d?.latitud
  const longitud = d?.longitud
  return typeof latitud === "number" && typeof longitud === "number" ? { latitud, longitud } : null
}

function direccionTexto(d: Record<string, unknown>): string {
  return ["direccion_linea1", "ciudad", "estado_provincia", "pais"]
    .map((k) => d[k])
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(", ")
}
