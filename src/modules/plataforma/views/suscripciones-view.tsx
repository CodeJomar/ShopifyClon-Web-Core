"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { FiltroSelect, type OpcionFiltro } from "@/shared/components/composed/filtro-select"
import { formatearFecha } from "@/shared/utils/fechas"
import type { SuscripcionPlataformaDto, ConsultaPaginadaDto } from "@/dtos/plataforma"
import type { ErrorApi } from "@/lib/api/error-api"
import { listarSuscripcionesAction } from "../actions/plataforma.actions"
import {
  FORMULARIO_ESTADO_TIENDA_PLATAFORMA,
  SuspenderTiendaForm,
} from "../components/suspender-tienda-form"

const FILTRO_ESTADOS: OpcionFiltro[] = [
  { value: "TODOS", label: "Todos los estados" },
  { value: "ACTIVA", label: "Activa" },
  { value: "PRUEBA", label: "En prueba" },
  { value: "SUSPENDIDA", label: "Suspendida" },
  { value: "VENCIDA", label: "Vencida" },
  { value: "CANCELADA", label: "Cancelada" },
]

function renderEstadoBadge(estado: string) {
  switch (estado) {
    case "ACTIVA":
      return (
        <Badge variant="estado" tono="exito">
          Activa
        </Badge>
      )
    case "PRUEBA":
      return (
        <Badge variant="estado" tono="aviso">
          Prueba
        </Badge>
      )
    case "SUSPENDIDA":
      return (
        <Badge variant="estado" tono="peligro">
          Suspendida
        </Badge>
      )
    case "VENCIDA":
      return (
        <Badge variant="estado" tono="peligro">
          Vencida
        </Badge>
      )
    case "CANCELADA":
      return (
        <Badge variant="estado" tono="neutro">
          Cancelada
        </Badge>
      )
    default:
      return (
        <Badge variant="estado" tono="neutro">
          {estado}
        </Badge>
      )
  }
}

export function SuscripcionesView() {
  const [pagina, setPagina] = React.useState(0)
  const [estadoFiltro, setEstadoFiltro] = React.useState("TODOS")
  const [datos, setDatos] = React.useState<ConsultaPaginadaDto<SuscripcionPlataformaDto> | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const [panelEstado, setPanelEstado] = React.useState<{
    abierto: boolean
    suscripcion: SuscripcionPlataformaDto | null
    accion: "suspender" | "reactivar"
  }>({
    abierto: false,
    suscripcion: null,
    accion: "suspender",
  })

  const cargar = React.useCallback(async () => {
    setCargando(true)
    const estadoParam = estadoFiltro === "TODOS" ? undefined : estadoFiltro
    const res = await listarSuscripcionesAction({ estado: estadoParam, pagina })
    if (res.ok) {
      setError(null)
      setDatos(res.datos)
    } else {
      setError(res.error)
    }
    setCargando(false)
  }, [estadoFiltro, pagina])

  React.useEffect(() => {
    let cancelado = false
    const estadoParam = estadoFiltro === "TODOS" ? undefined : estadoFiltro
    listarSuscripcionesAction({ estado: estadoParam, pagina }).then((res) => {
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
  }, [estadoFiltro, pagina])

  const manejarCambioFiltro = (nuevoEstado: string) => {
    setEstadoFiltro(nuevoEstado)
    setPagina(0)
  }

  const items = datos?.datos ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">
            Suscripciones de tiendas
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Monitorea el estado de suscripción de todas las tiendas de la plataforma y gestiona suspensiones.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <FiltroSelect
            label="Filtrar por estado"
            value={estadoFiltro}
            onValueChange={manejarCambioFiltro}
            opciones={FILTRO_ESTADOS}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las suscripciones</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {cargando && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando suscripciones…
        </p>
      )}

      {!cargando && !error && items.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <EstadoVacio
              titulo="No se encontraron suscripciones"
              descripcion={
                estadoFiltro !== "TODOS"
                  ? "No hay tiendas en el estado seleccionado. Intenta cambiar el filtro."
                  : "Aún no hay tiendas con suscripción registrada en la plataforma."
              }
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
                  <TableHead>Subdominio / Vitrina</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fin de período actual</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((sub) => {
                  const estaSuspendida = sub.estado === "SUSPENDIDA"
                  return (
                    <TableRow key={sub.tienda_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{sub.subdominio}</span>
                          <Link
                            href={`/tienda/${sub.subdominio}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground inline-flex items-center"
                            title={`Visitar vitrina de ${sub.subdominio}`}
                          >
                            <ExternalLink className="size-3.5" aria-hidden="true" />
                            <span className="sr-only">Visitar vitrina de {sub.subdominio}</span>
                          </Link>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground block truncate max-w-[200px]">
                          {sub.tienda_id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {sub.codigo_plan}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderEstadoBadge(sub.estado)}</TableCell>
                      <TableCell className="text-[13px]">
                        {sub.fin_periodo_actual ? (
                          formatearFecha(sub.fin_periodo_actual)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {estaSuspendida ? (
                          <Button
                            variant="neutral"
                            size="sm"
                            onClick={() =>
                              setPanelEstado({
                                abierto: true,
                                suscripcion: sub,
                                accion: "reactivar",
                              })
                            }
                          >
                            <ShieldCheck className="size-3.5" aria-hidden="true" />
                            <span>Reactivar</span>
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setPanelEstado({
                                abierto: true,
                                suscripcion: sub,
                                accion: "suspender",
                              })
                            }
                          >
                            <ShieldAlert className="size-3.5" aria-hidden="true" />
                            <span>Suspender</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {datos && (
            <BarraPaginacion
              pagina={datos.pagina_actual + 1}
              totalPaginas={Math.max(1, datos.total_paginas)}
              total={datos.total}
              porPagina={datos.tamano_pagina}
              etiqueta="suscripciones"
              onCambiar={(n) => setPagina(n - 1)}
            />
          )}
        </>
      )}

      {/* FormPanel Suspender / Reactivar */}
      <FormPanel
        open={panelEstado.abierto}
        onOpenChange={(abierto) =>
          setPanelEstado((prev) => ({
            ...prev,
            abierto,
            suscripcion: abierto ? prev.suscripcion : null,
          }))
        }
        title={
          panelEstado.accion === "suspender"
            ? `Suspender tienda: ${panelEstado.suscripcion?.subdominio ?? ""}`
            : `Reactivar tienda: ${panelEstado.suscripcion?.subdominio ?? ""}`
        }
        description={
          panelEstado.accion === "suspender"
            ? "Indica el motivo por el cual se suspenderá la tienda en la plataforma."
            : "Indica el motivo por el cual se reactivará la tienda en la plataforma."
        }
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelEstado((prev) => ({ ...prev, abierto: false, suscripcion: null }))}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form={FORMULARIO_ESTADO_TIENDA_PLATAFORMA}
              variant={panelEstado.accion === "suspender" ? "danger" : "default"}
            >
              {panelEstado.accion === "suspender" ? "Confirmar suspensión" : "Confirmar reactivación"}
            </Button>
          </>
        }
      >
        {panelEstado.suscripcion && (
          <SuspenderTiendaForm
            key={`${panelEstado.suscripcion.tienda_id}-${panelEstado.accion}`}
            suscripcion={panelEstado.suscripcion}
            accion={panelEstado.accion}
            onGuardado={() => {
              setPanelEstado((prev) => ({ ...prev, abierto: false, suscripcion: null }))
              cargar()
            }}
          />
        )}
      </FormPanel>
    </div>
  )
}
