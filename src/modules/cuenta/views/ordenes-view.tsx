"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Receipt } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { ordenesCuentaAction } from "../actions/cuenta.actions"
import { ETIQUETA_PAGO, ETIQUETA_PREPARACION, etiquetaDe } from "../utils-orden"
import type { OrdenCuentaDto } from "@/dtos/cuenta"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { ErrorApi } from "@/lib/api/error-api"

/** Historial de compras. La API empieza en la página 0; la barra muestra desde 1. */
export function OrdenesView() {
  const router = useRouter()
  const [pagina, setPagina] = React.useState(0)
  const [datos, setDatos] = React.useState<Paginado<OrdenCuentaDto> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    ordenesCuentaAction(pagina).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [pagina])

  const ordenes = datos?.datos ?? []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cuenta" className="text-[12px] font-bold text-brand-text hover:underline">
          ← Mi cuenta
        </Link>
        <h1 className="mt-1 text-[18px] font-extrabold tracking-tight text-foreground">Mis órdenes</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Las compras que hiciste en cualquier tienda.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar tus órdenes</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando tus órdenes…
        </p>
      )}

      {datos && ordenes.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio titulo="Aún no tienes compras" descripcion="Cuando compres en una tienda, tus órdenes aparecerán aquí." icono={Receipt} />
          </CardContent>
        </Card>
      )}

      {datos && ordenes.length > 0 && (
        <>
          {/* Escritorio: tabla */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Entrega</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenes.map((orden) => {
                    const pago = etiquetaDe(ETIQUETA_PAGO, orden.estado_pago)
                    const preparacion = etiquetaDe(ETIQUETA_PREPARACION, orden.estado_preparacion)
                    return (
                      <TableRow key={orden.id} className="cursor-pointer" onClick={() => router.push(`/cuenta/ordenes/${orden.id}`)}>
                        <TableCell className="font-mono text-[12.5px] font-bold">
                          <Link href={`/cuenta/ordenes/${orden.id}`} className="hover:underline">
                            {orden.numero_orden}
                          </Link>
                        </TableCell>
                        <TableCell>{orden.tienda_nombre}</TableCell>
                        <TableCell>{formatearFecha(orden.fecha_creacion)}</TableCell>
                        <TableCell className="text-right font-bold">{formatearDinero(Number(orden.total), orden.moneda)}</TableCell>
                        <TableCell>
                          <Badge variant="estado" tono={pago.tono}>{pago.texto}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="estado" tono={preparacion.tono}>{preparacion.texto}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Móvil: lista */}
          <ul className="space-y-3 md:hidden">
            {ordenes.map((orden) => {
              const pago = etiquetaDe(ETIQUETA_PAGO, orden.estado_pago)
              const preparacion = etiquetaDe(ETIQUETA_PREPARACION, orden.estado_preparacion)
              return (
                <li key={orden.id}>
                  <Link href={`/cuenta/ordenes/${orden.id}`} className="block">
                    <Card>
                      <CardContent className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-[12.5px] font-bold text-foreground">{orden.numero_orden}</p>
                            <p className="truncate text-[13px] text-muted-foreground">{orden.tienda_nombre}</p>
                          </div>
                          <p className="shrink-0 font-bold text-foreground">{formatearDinero(Number(orden.total), orden.moneda)}</p>
                        </div>
                        <p className="text-[12.5px] text-muted-foreground">{formatearFecha(orden.fecha_creacion)}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="estado" tono={pago.tono}>{pago.texto}</Badge>
                          <Badge variant="estado" tono={preparacion.tono}>{preparacion.texto}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>

          <BarraPaginacion
            pagina={datos.pagina_actual + 1}
            totalPaginas={Math.max(1, datos.total_paginas)}
            total={datos.total}
            porPagina={datos.tamano_pagina}
            etiqueta="órdenes"
            onCambiar={(numero) => setPagina(numero - 1)}
          />
        </>
      )}
    </div>
  )
}
