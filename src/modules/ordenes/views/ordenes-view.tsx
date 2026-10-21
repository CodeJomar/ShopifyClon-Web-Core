"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import type { OrdenLista } from "@/dtos/ordenes"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { ErrorApi } from "@/lib/api/error-api"
import { listarOrdenesAction, type FiltrosOrdenes } from "../actions/ordenes.actions"
import { ETIQUETA_ESTADO, ETIQUETA_PAGO, ETIQUETA_PREPARACION } from "../etiquetas"

const TODOS = ""

/** Órdenes de la tienda: filtros (texto, estados, fechas) y paginación. La página de la API empieza en 0. */
export function OrdenesView() {
  const { tienda, puede } = usePanel()
  const puedeVer = puede(PERMISO.ORDENES_VER)
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"
  const [pagina, setPagina] = React.useState(0)
  const [filtros, setFiltros] = React.useState<FiltrosOrdenes>({})
  const [datos, setDatos] = React.useState<Paginado<OrdenLista> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const filtrosClave = JSON.stringify(filtros)

  React.useEffect(() => {
    if (!puedeVer) return
    let cancelado = false
    listarOrdenesAction(pagina, JSON.parse(filtrosClave) as FiltrosOrdenes).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [puedeVer, pagina, filtrosClave])

  if (!puedeVer) {
    return <EstadoVacio titulo="No tienes acceso a las órdenes" descripcion="Pide a quien administra la tienda que te dé permiso." />
  }

  const actualizar = (cambio: Partial<FiltrosOrdenes>) => {
    setPagina(0)
    setFiltros((f) => ({ ...f, ...cambio }))
  }
  const lista = datos?.datos ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Órdenes</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Las compras de tu tienda, de la más reciente a la más antigua.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las órdenes</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <FloatingInput label="Número o correo" value={filtros.texto ?? ""} onChange={(e) => actualizar({ texto: e.target.value || undefined })} />
          <SelectNativo etiqueta="Estado" valor={filtros.estado ?? TODOS} onCambiar={(v) => actualizar({ estado: v || undefined })} opciones={[["", "Todos"], ["ABIERTA", "Abierta"], ["CERRADA", "Completada"], ["CANCELADA", "Cancelada"]]} />
          <SelectNativo etiqueta="Pago" valor={filtros.estado_pago ?? TODOS} onCambiar={(v) => actualizar({ estado_pago: v || undefined })} opciones={[["", "Todos"], ["PENDIENTE", "Pago pendiente"], ["PAGADO", "Pagada"], ["PARCIALMENTE_REEMBOLSADO", "Reembolso parcial"], ["REEMBOLSADO", "Reembolsada"], ["ANULADO", "Anulada"]]} />
          <SelectNativo etiqueta="Preparación" valor={filtros.estado_preparacion ?? TODOS} onCambiar={(v) => actualizar({ estado_preparacion: v || undefined })} opciones={[["", "Todos"], ["NO_PREPARADO", "Sin preparar"], ["PREPARADO", "Preparada"], ["ENTREGADO", "Entregada"]]} />
          <CampoFecha etiqueta="Desde" valor={filtros.desde} onCambiar={(v) => actualizar({ desde: v })} />
          <CampoFecha etiqueta="Hasta" valor={filtros.hasta} onCambiar={(v) => actualizar({ hasta: v })} />
        </CardContent>
      </Card>

      {datos && lista.length === 0 && !error && (
        <EstadoVacio titulo="Aún no tienes órdenes" descripcion="Cuando tus clientes compren, aparecerán aquí." />
      )}

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {lista.map((o) => (
          <li key={o.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0 space-y-1">
              <Link href={`/panel/ordenes/${o.id}`} className="text-[13px] font-extrabold text-brand-text hover:underline">
                {o.numero_orden}
              </Link>
              <p className="truncate text-[12px] text-muted-foreground">
                {o.nombre_cliente} · {o.correo_cliente} · {formatearFecha(o.fecha_creacion, zonaHoraria)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="estado" tono={ETIQUETA_ESTADO[o.estado].tono}>{ETIQUETA_ESTADO[o.estado].texto}</Badge>
                <Badge variant="estado" tono={ETIQUETA_PAGO[o.estado_pago].tono}>{ETIQUETA_PAGO[o.estado_pago].texto}</Badge>
                <Badge variant="estado" tono={ETIQUETA_PREPARACION[o.estado_preparacion].tono}>{ETIQUETA_PREPARACION[o.estado_preparacion].texto}</Badge>
              </div>
            </div>
            <p className="text-[14px] font-extrabold">{formatearDinero(o.total, o.moneda)}</p>
          </li>
        ))}
      </ul>

      {datos && datos.total_paginas > 0 && (
        <BarraPaginacion
          pagina={datos.pagina_actual + 1}
          totalPaginas={Math.max(1, datos.total_paginas)}
          total={datos.total}
          porPagina={datos.tamano_pagina}
          etiqueta="órdenes"
          onCambiar={(numero) => setPagina(numero - 1)}
        />
      )}
    </div>
  )
}

function SelectNativo({
  etiqueta,
  valor,
  opciones,
  onCambiar,
}: {
  etiqueta: string
  valor: string
  opciones: [string, string][]
  onCambiar: (valor: string) => void
}) {
  return (
    <label className="block space-y-1.5 text-[13px]">
      <span className="font-bold">{etiqueta}</span>
      <select className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]" value={valor} onChange={(e) => onCambiar(e.target.value)}>
        {opciones.map(([v, t]) => (
          <option key={v || "todos"} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  )
}

function CampoFecha({ etiqueta, valor, onCambiar }: { etiqueta: string; valor?: string; onCambiar: (valor: string | undefined) => void }) {
  return (
    <label className="block space-y-1.5 text-[13px]">
      <span className="font-bold">{etiqueta}</span>
      <input type="date" className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]" value={valor ?? ""} onChange={(e) => onCambiar(e.target.value || undefined)} />
    </label>
  )
}
