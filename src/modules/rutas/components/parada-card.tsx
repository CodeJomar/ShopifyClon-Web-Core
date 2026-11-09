"use client"

import * as React from "react"
import Link from "next/link"
import { Check, ChevronDown, History, ImagePlus, MapPin, Phone, TriangleAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { toast } from "@/shared/components/ui/toast"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { VisorUbicacion } from "@/shared/components/composed/mapa-ubicacion"
import { subirImagenAction } from "@/modules/catalogo/actions/catalogo.actions"
import { cn } from "@/shared/utils/cn"
import type { EventoEnvio, ParadaRuta } from "@/dtos/ruta"
import { entregarEnvioAction, eventosEnvioAction, noEntregadoAction } from "../actions/rutas.actions"
import { ETIQUETA_EVENTO } from "../etiquetas"
import { LineaTiempoEnvio } from "./linea-tiempo-envio"

const ETIQUETA_ENVIO = {
  CREADO: ETIQUETA_EVENTO.CREADO,
  EN_TRANSITO: ETIQUETA_EVENTO.EN_TRANSITO,
  ENTREGADO: ETIQUETA_EVENTO.ENTREGADO,
  DEVUELTO: ETIQUETA_EVENTO.DEVUELTO,
} as const

type Panel = "mapa" | "historial" | "entregar" | "no-entregado" | null

/**
 * Una parada de la ruta: destinatario, dirección, productos, mapa del punto de entrega, historial y,
 * si la ruta está en curso, el cambio de estado (entregado con foto opcional, o no entregado con motivo).
 */
export function ParadaCard({
  parada,
  puedeCambiar,
  zonaHoraria,
  alCambiar,
}: {
  parada: ParadaRuta
  /** La ruta está en curso y la persona puede gestionar órdenes. */
  puedeCambiar: boolean
  zonaHoraria?: string
  alCambiar: () => void
}) {
  const [panel, setPanel] = React.useState<Panel>(null)
  const [eventos, setEventos] = React.useState<EventoEnvio[] | null>(null)
  const [motivo, setMotivo] = React.useState("")
  const [nota, setNota] = React.useState("")
  const [foto, setFoto] = React.useState<{ url: string; nombre: string } | null>(null)
  const [subiendo, setSubiendo] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  const [error, setError] = React.useState<{ message: string } | null>(null)

  const punto = parada.latitud != null && parada.longitud != null ? { latitud: parada.latitud, longitud: parada.longitud } : null
  const entregable = puedeCambiar && parada.estado_envio === "EN_TRANSITO"
  const d = parada.direccion
  const etiqueta = ETIQUETA_ENVIO[parada.estado_envio]

  const alternar = (destino: Exclude<Panel, null>) => {
    setError(null)
    setPanel((actual) => (actual === destino ? null : destino))
    if (destino === "historial" && !eventos) {
      eventosEnvioAction(parada.envio_id).then((res) => {
        if (res.ok) setEventos(res.datos)
        else setError(res.error)
      })
    }
  }

  const subirFoto = async (archivo: File) => {
    setSubiendo(true)
    setError(null)
    const res = await subirImagenAction(archivo)
    setSubiendo(false)
    if (!res.ok) return setError(res.error)
    setFoto({ url: res.datos.url, nombre: archivo.name })
  }

  const confirmarEntrega = async () => {
    setGuardando(true)
    setError(null)
    const res = await entregarEnvioAction(parada.envio_id, { foto_url: foto?.url, nota: nota.trim() || undefined })
    setGuardando(false)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: `Entrega registrada · ${parada.numero_orden}` })
    setPanel(null)
    setEventos(null)
    alCambiar()
  }

  const confirmarNoEntregado = async () => {
    if (!motivo.trim()) return setError({ message: "Escribe el motivo por el que no se pudo entregar." })
    setGuardando(true)
    setError(null)
    const res = await noEntregadoAction(parada.envio_id, motivo.trim())
    setGuardando(false)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: `Intento registrado · ${parada.numero_orden}` })
    setPanel(null)
    setMotivo("")
    setEventos(null)
    alCambiar()
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-extrabold text-primary-foreground" aria-hidden="true">
            {parada.posicion}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/panel/ordenes/${parada.orden_id}`} className="font-mono text-[13px] font-extrabold text-brand-text hover:underline">
                {parada.numero_orden}
              </Link>
              <Badge variant="estado" tono={etiqueta.tono}>{etiqueta.texto}</Badge>
              {parada.numero_guia && <span className="font-mono text-[12px] text-muted-foreground">Guía {parada.numero_guia}</span>}
            </div>
            <p className="mt-0.5 text-[15px] font-extrabold text-foreground">{parada.destinatario}</p>
            <p className="mt-1 flex items-start gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {d.direccion_linea1}
                {d.direccion_linea2 ? ` (${d.direccion_linea2})` : ""}, {d.ciudad}, {d.estado_provincia}
              </span>
            </p>
            {parada.telefono && (
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <a href={`tel:${parada.telefono}`} className="hover:text-foreground hover:underline">{parada.telefono}</a>
              </p>
            )}
          </div>
        </div>

        <ul className="rounded-xl bg-secondary/60 px-3.5 py-2.5 text-[13px]">
          {parada.items.map((i, n) => (
            <li key={n} className="flex justify-between gap-3 py-0.5">
              <span className="min-w-0 truncate">
                {i.titulo_producto}
                {i.titulo_variante && i.titulo_variante !== "Predeterminada" ? ` · ${i.titulo_variante}` : ""}
              </span>
              <span className="shrink-0 font-bold">× {i.cantidad}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-1.5">
          {punto && (
            <Button variant={panel === "mapa" ? "soft" : "ghost"} size="sm" aria-expanded={panel === "mapa"} onClick={() => alternar("mapa")} leftIcon={<MapPin aria-hidden="true" />} rightIcon={<ChevronDown aria-hidden="true" className={cn("transition-transform", panel === "mapa" && "rotate-180")} />}>
              Ver mapa
            </Button>
          )}
          <Button variant={panel === "historial" ? "soft" : "ghost"} size="sm" aria-expanded={panel === "historial"} onClick={() => alternar("historial")} leftIcon={<History aria-hidden="true" />}>
            Historial
          </Button>
          {entregable && (
            <>
              <Button size="sm" className="ml-auto" onClick={() => alternar("entregar")} leftIcon={<Check aria-hidden="true" />}>
                Entregado
              </Button>
              <Button size="sm" variant="outline" onClick={() => alternar("no-entregado")} leftIcon={<TriangleAlert aria-hidden="true" />}>
                No entregado
              </Button>
            </>
          )}
        </div>

        {!punto && (
          <p className="text-[12px] text-muted-foreground">Esta orden no tiene un punto marcado en el mapa (es anterior a ese requisito).</p>
        )}

        {panel === "mapa" && punto && <VisorUbicacion valor={punto} />}

        {panel === "historial" && <LineaTiempoEnvio eventos={eventos} zonaHoraria={zonaHoraria} />}

        {panel === "entregar" && (
          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-[13px] font-bold">Confirmar la entrega a {parada.destinatario}</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-[1.8px] border-dashed border-input px-3.5 py-2 text-[13px] font-semibold text-muted-foreground hover:border-brand-strong hover:text-brand-text">
                <ImagePlus className="size-4" aria-hidden="true" />
                {subiendo ? "Subiendo…" : foto ? "Cambiar foto" : "Agregar foto (opcional)"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={subiendo}
                  onChange={(e) => {
                    const archivo = e.target.files?.[0]
                    if (archivo) void subirFoto(archivo)
                    e.target.value = ""
                  }}
                />
              </label>
              {foto && (
                <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vista previa de la foto recién subida */}
                  <img src={foto.url} alt="Foto de la entrega" className="h-12 w-auto rounded-md border border-border object-cover" />
                  {foto.nombre}
                </span>
              )}
            </div>
            <FloatingTextarea label="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} rows={2} />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPanel(null)}>Cancelar</Button>
              <Button size="sm" loading={guardando} disabled={subiendo} onClick={confirmarEntrega}>Confirmar entrega</Button>
            </div>
          </div>
        )}

        {panel === "no-entregado" && (
          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-[13px] font-bold">¿Por qué no se pudo entregar?</p>
            <FloatingTextarea label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} maxLength={500} />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPanel(null)}>Cancelar</Button>
              <Button size="sm" loading={guardando} onClick={confirmarNoEntregado}>Registrar intento</Button>
            </div>
          </div>
        )}

        {error && panel !== "entregar" && panel !== "no-entregado" && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
