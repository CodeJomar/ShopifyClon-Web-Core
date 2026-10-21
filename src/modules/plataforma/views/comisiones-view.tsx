"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { formatearDinero } from "@/shared/utils/dinero"
import type { ComisionTiendaDto, ConsultaPaginadaDto } from "@/dtos/plataforma"
import type { ErrorApi } from "@/lib/api/error-api"
import { listarComisionesAction } from "../actions/plataforma.actions"

export function ComisionesView() {
  const [pagina, setPagina] = React.useState(0)
  const [datos, setDatos] = React.useState<ConsultaPaginadaDto<ComisionTiendaDto> | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    listarComisionesAction({ pagina }).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else {
        setError(res.error)
      }
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [pagina])

  const items = datos?.datos ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">
          Métricas de comisiones por tienda
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Resumen histórico de volumen de ventas facturadas y comisiones generadas para la plataforma.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las comisiones</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {cargando && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando métricas de comisiones…
        </p>
      )}

      {!cargando && !error && items.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <EstadoVacio
              titulo="No hay comisiones registradas"
              descripcion="Aún no se han generado órdenes de venta con comisiones en las tiendas de la plataforma."
            />
          </CardContent>
        </Card>
      )}

      {!cargando && !error && items.length > 0 && (
        <>
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tienda / Subdominio</TableHead>
                  <TableHead>Plan vigente</TableHead>
                  <TableHead className="text-right">Ventas históricas</TableHead>
                  <TableHead className="text-right">Comisiones acumuladas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.tienda_id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{item.nombre}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] text-muted-foreground font-mono">
                          {item.subdominio}
                        </span>
                        <Link
                          href={`/tienda/${item.subdominio}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground inline-flex items-center"
                          title={`Visitar vitrina de ${item.subdominio}`}
                        >
                          <ExternalLink className="size-3" aria-hidden="true" />
                          <span className="sr-only">Visitar vitrina de {item.subdominio}</span>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.plan_vigente}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-[13px]">
                      {formatearDinero(item.total_ventas_historico, "USD")}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[13px] text-primary">
                      {formatearDinero(item.total_comisiones, "USD")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {datos && (
            <BarraPaginacion
              pagina={datos.pagina_actual + 1}
              totalPaginas={Math.max(1, datos.total_paginas)}
              total={datos.total}
              porPagina={datos.tamano_pagina}
              etiqueta="tiendas con comisiones"
              onCambiar={(n) => setPagina(n - 1)}
            />
          )}
        </>
      )}
    </div>
  )
}
