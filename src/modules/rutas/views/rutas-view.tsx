"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Flag, Play, Plus, Printer, Route } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { toast } from "@/shared/components/ui/toast"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { useConfirm } from "@/shared/providers/confirm-provider"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { RutaLista } from "@/dtos/ruta"
import type { ErrorApi } from "@/lib/api/error-api"
import { finalizarRutaAction, iniciarRutaAction, listarRutasAction } from "../actions/rutas.actions"
import { ETIQUETA_RUTA, formatearDia } from "../etiquetas"

const TODAS = ""
const ESTADOS = [
  { valor: TODAS, etiqueta: "Todas" },
  { valor: "BORRADOR", etiqueta: "Borradores" },
  { valor: "EN_CURSO", etiqueta: "En curso" },
  { valor: "FINALIZADA", etiqueta: "Finalizadas" },
]

/** Hojas de ruta de la tienda: cada ruta agrupa envíos para un chofer y un día. La página de la API empieza en 0. */
export function RutasView() {
  const confirmar = useConfirm()
  const [estado, setEstado] = React.useState(TODAS)
  const [pagina, setPagina] = React.useState(0)
  const [datos, setDatos] = React.useState<Paginado<RutaLista> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [ocupada, setOcupada] = React.useState<string | null>(null)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    listarRutasAction(pagina, estado || undefined).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelado = true
    }
  }, [pagina, estado, version])

  const lista = datos?.datos ?? []
  const cargando = !datos && !error

  const cambiarEstado = async (ruta: RutaLista, accion: "iniciar" | "finalizar") => {
    const iniciar = accion === "iniciar"
    const aceptado = await confirmar({
      title: iniciar ? `¿Iniciar la ruta ${ruta.codigo}?` : `¿Finalizar la ruta ${ruta.codigo}?`,
      description: iniciar
        ? "Los envíos de la ruta pasarán a «En camino» y ya no podrás cambiar sus paradas."
        : "La ruta se cerrará. Las paradas que sigan pendientes quedarán como están.",
      confirmText: iniciar ? "Sí, iniciar" : "Sí, finalizar",
    })
    if (!aceptado) return
    setOcupada(ruta.id)
    const res = iniciar ? await iniciarRutaAction(ruta.id) : await finalizarRutaAction(ruta.id)
    setOcupada(null)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: iniciar ? "Ruta iniciada" : "Ruta finalizada" })
    setVersion((v) => v + 1)
  }

  const acciones = (r: RutaLista) => (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Link href={`/panel/rutas/${r.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <Eye aria-hidden="true" /> Detalle
      </Link>
      <Link href={`/panel/rutas/${r.id}/guia`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <Printer aria-hidden="true" /> Guía
      </Link>
      {r.estado === "BORRADOR" && (
        <Button size="sm" variant="soft" loading={ocupada === r.id} onClick={() => cambiarEstado(r, "iniciar")} leftIcon={<Play aria-hidden="true" />}>
          Iniciar
        </Button>
      )}
      {r.estado === "EN_CURSO" && (
        <Button size="sm" variant="soft" loading={ocupada === r.id} onClick={() => cambiarEstado(r, "finalizar")} leftIcon={<Flag aria-hidden="true" />}>
          Finalizar
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Rutas de reparto"
        descripcion="Agrupa los envíos de un día para un chofer, imprime su guía de remisión y sigue cada entrega."
        acciones={
          <Link href="/panel/rutas/nueva" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Nueva ruta
          </Link>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <ControlSegmentado
            aria-label="Estado de la ruta"
            opciones={ESTADOS}
            valor={estado}
            onCambiar={(v) => {
              setEstado(v)
              setPagina(0)
            }}
          />
        </CardContent>
      </Card>

      {cargando && (
        <div className="space-y-2" aria-busy="true" aria-label="Cargando rutas">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {datos && lista.length === 0 && !error && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={Route}
              titulo={estado ? "No hay rutas en este estado" : "Aún no tienes rutas"}
              descripcion={estado ? "Prueba con otro estado." : "Crea una ruta con los envíos que saldrán hoy y asígnala a un chofer."}
            />
          </CardContent>
        </Card>
      )}

      {lista.length > 0 && (
        <>
          {/* Escritorio: tabla */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Ruta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Chofer</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Entregas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6 font-mono text-[12.5px] font-bold">
                      <Link href={`/panel/rutas/${r.id}`} className="text-brand-text hover:underline">
                        {r.codigo}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[13px]">{formatearDia(r.fecha)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-[13px] font-bold">{r.chofer}</TableCell>
                    <TableCell className="font-mono text-[12.5px]">{r.placa}</TableCell>
                    <TableCell className="whitespace-nowrap text-[13px]">
                      {r.paradas_entregadas} de {r.total_paradas}
                    </TableCell>
                    <TableCell>
                      <Badge variant="estado" tono={ETIQUETA_RUTA[r.estado].tono}>{ETIQUETA_RUTA[r.estado].texto}</Badge>
                    </TableCell>
                    <TableCell className="pr-6">{acciones(r)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Móvil: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {lista.map((r) => (
              <li key={r.id} className="space-y-3 rounded-xl border border-island-border bg-card p-4 shadow-isla">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] font-extrabold text-brand-text">{r.codigo}</p>
                    <p className="truncate text-[13px] font-bold text-foreground">{r.chofer} · {r.placa}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {formatearDia(r.fecha)} · {r.paradas_entregadas} de {r.total_paradas} entregas
                    </p>
                  </div>
                  <Badge variant="estado" tono={ETIQUETA_RUTA[r.estado].tono}>{ETIQUETA_RUTA[r.estado].texto}</Badge>
                </div>
                {acciones(r)}
              </li>
            ))}
          </ul>
        </>
      )}

      {datos && datos.total_paginas > 0 && (
        <BarraPaginacion
          pagina={datos.pagina_actual + 1}
          totalPaginas={Math.max(1, datos.total_paginas)}
          total={datos.total}
          porPagina={datos.tamano_pagina}
          etiqueta="rutas"
          onCambiar={(numero) => setPagina(numero - 1)}
        />
      )}
    </div>
  )
}
