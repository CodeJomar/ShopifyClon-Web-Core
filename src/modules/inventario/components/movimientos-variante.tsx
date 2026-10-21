"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { formatearFecha } from "@/shared/utils/fechas"
import type { ErrorApi } from "@/lib/api/error-api"
import type { MovimientoInventarioDto } from "@/dtos/inventario"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import { movimientosAction } from "../actions/inventario.actions"

/** Nombres en español de los tipos de movimiento (INV-008). Un tipo desconocido se muestra tal cual. */
const TIPOS: Record<string, string> = {
  INICIAL: "Inicial",
  AJUSTE: "Ajuste manual",
  RESERVA: "Reserva",
  LIBERACION: "Liberación",
  VENTA: "Venta",
  REPOSICION: "Reposición",
}

const signo = (n: number) => (n > 0 ? `+${n}` : String(n))

/** Historial paginado de movimientos de una variante (página de la API desde 0). */
export function MovimientosVariante({ varianteId, zonaHoraria }: { varianteId: string; zonaHoraria?: string }) {
  const [pagina, setPagina] = React.useState(0)
  const [datos, setDatos] = React.useState<Paginado<MovimientoInventarioDto> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    movimientosAction(varianteId, pagina).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [varianteId, pagina])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No pudimos cargar el historial</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }
  if (!datos) return <p className="text-[13px] text-muted-foreground">Cargando movimientos…</p>
  if (datos.datos.length === 0) return <EstadoVacio titulo="Sin movimientos" descripcion="Aquí aparecerán los ajustes y las ventas de esta variante." />

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border">
        {datos.datos.map((m) => (
          <li key={m.id} className="space-y-1 py-3 text-[13px]">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">{TIPOS[m.tipo] ?? m.tipo}</span>
              <span className="text-muted-foreground">{formatearFecha(m.fecha, zonaHoraria)}</span>
            </div>
            <p>
              Disponible {signo(m.delta_disponible)} → {m.disponible_resultante} · Reservado {signo(m.delta_reservado)} → {m.reservado_resultante}
            </p>
            {m.motivo && <p className="text-muted-foreground">Motivo: {m.motivo}</p>}
            {m.orden_id && <p className="text-muted-foreground">Orden: {m.orden_id}</p>}
          </li>
        ))}
      </ul>
      {datos.total_paginas > 1 && (
        <BarraPaginacion
          pagina={datos.pagina_actual + 1}
          totalPaginas={Math.max(1, datos.total_paginas)}
          total={datos.total}
          porPagina={datos.tamano_pagina}
          etiqueta="movimientos"
          onCambiar={(numero) => setPagina(numero - 1)}
        />
      )}
    </div>
  )
}
