"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, ReceiptText, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { SearchInput } from "@/shared/components/composed/search-input"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { cn } from "@/shared/utils/cn"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { useEstadoEnVivo, useEventosOrdenes } from "@/modules/panel/context/tiempo-real"
import { IndicadorEnVivo } from "@/shared/components/composed/indicador-en-vivo"
import { PERMISO } from "@/shared/constants/permisos"
import type { OrdenLista } from "@/dtos/ordenes"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { ErrorApi } from "@/lib/api/error-api"
import { listarOrdenesAction, type FiltrosOrdenes } from "../actions/ordenes.actions"
import { ETIQUETA_ESTADO, ETIQUETA_PAGO, ETIQUETA_PREPARACION } from "../etiquetas"

const TODOS = ""

const ESTADOS = [
  { valor: TODOS, etiqueta: "Todas" },
  { valor: "ABIERTA", etiqueta: "Abiertas" },
  { valor: "CERRADA", etiqueta: "Completadas" },
  { valor: "CANCELADA", etiqueta: "Canceladas" },
]

const PAGOS: [string, string][] = [["", "Todos"], ["PENDIENTE", "Pago pendiente"], ["PAGADO", "Pagada"], ["PARCIALMENTE_REEMBOLSADO", "Reembolso parcial"], ["REEMBOLSADO", "Reembolsada"], ["ANULADO", "Anulada"]]
const PREPARACIONES: [string, string][] = [["", "Todas"], ["NO_PREPARADO", "Sin preparar"], ["PREPARADO", "Preparada"], ["ENTREGADO", "Entregada"]]

/** Órdenes de la tienda: pestañas por estado, búsqueda, filtros avanzados plegables y paginación. La página de la API empieza en 0. */
export function OrdenesView() {
  const router = useRouter()
  const { tienda, puede } = usePanel()
  const puedeVer = puede(PERMISO.ORDENES_VER)
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"
  const [pagina, setPagina] = React.useState(0)
  const [filtros, setFiltros] = React.useState<FiltrosOrdenes>({})
  const [texto, setTexto] = React.useState("")
  const [masFiltros, setMasFiltros] = React.useState(false)
  const [datos, setDatos] = React.useState<Paginado<OrdenLista> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const filtrosClave = JSON.stringify(filtros)
  // Tiempo real (W-022): cada evento de órdenes o envíos vuelve a pedir la lista en vez de armarla a mano.
  const [version, setVersion] = React.useState(0)
  useEventosOrdenes(() => setVersion((v) => v + 1))
  const estadoEnVivo = useEstadoEnVivo()

  // La búsqueda espera a que termines de escribir para no pedir datos con cada tecla
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPagina(0)
      setFiltros((f) => (f.texto === (texto || undefined) ? f : { ...f, texto: texto || undefined }))
    }, 350)
    return () => clearTimeout(t)
  }, [texto])

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
  }, [puedeVer, pagina, filtrosClave, version])

  if (!puedeVer) {
    return <EstadoVacio titulo="No tienes acceso a las órdenes" descripcion="Pide a quien administra la tienda que te dé permiso." />
  }

  const actualizar = (cambio: Partial<FiltrosOrdenes>) => {
    setPagina(0)
    setFiltros((f) => ({ ...f, ...cambio }))
  }
  const avanzados = [filtros.estado_pago, filtros.estado_preparacion, filtros.desde, filtros.hasta].filter(Boolean).length
  const hayFiltros = Boolean(filtros.texto || filtros.estado || avanzados)
  const limpiar = () => {
    setTexto("")
    setPagina(0)
    setFiltros({})
  }
  const lista = datos?.datos ?? []
  const cargando = !datos && !error

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        acciones={<IndicadorEnVivo estado={estadoEnVivo} />}
        titulo="Órdenes"
        descripcion={datos ? `${datos.total} ${datos.total === 1 ? "orden" : "órdenes"}${hayFiltros ? " con estos filtros" : ""}, de la más reciente a la más antigua.` : "Las compras de tu tienda, de la más reciente a la más antigua."}
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las órdenes</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <ControlSegmentado aria-label="Estado de la orden" opciones={ESTADOS} valor={filtros.estado ?? TODOS} onCambiar={(v) => actualizar({ estado: v || undefined })} />
            <div className="flex flex-1 items-center gap-2 lg:max-w-xl">
              <div className="min-w-0 flex-1">
                <SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar por número o correo" />
              </div>
              <Button variant={avanzados ? "soft" : "neutral"} className="h-11 shrink-0" aria-expanded={masFiltros} onClick={() => setMasFiltros((v) => !v)} leftIcon={<SlidersHorizontal aria-hidden="true" />} rightIcon={<ChevronDown aria-hidden="true" className={cn("transition-transform", masFiltros && "rotate-180")} />}>
                Filtros{avanzados ? ` (${avanzados})` : ""}
              </Button>
            </div>
          </div>

          {masFiltros && (
            <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <CampoSelect etiqueta="Pago" valor={filtros.estado_pago ?? TODOS} onCambiar={(v) => actualizar({ estado_pago: v || undefined })} opciones={PAGOS} />
              <CampoSelect etiqueta="Preparación" valor={filtros.estado_preparacion ?? TODOS} onCambiar={(v) => actualizar({ estado_preparacion: v || undefined })} opciones={PREPARACIONES} />
              <CampoFecha etiqueta="Desde" valor={filtros.desde} onCambiar={(v) => actualizar({ desde: v })} />
              <CampoFecha etiqueta="Hasta" valor={filtros.hasta} onCambiar={(v) => actualizar({ hasta: v })} />
            </div>
          )}

          {hayFiltros && (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <p className="text-[12.5px] text-muted-foreground">Estás viendo una lista filtrada.</p>
              <Button variant="ghost" size="sm" onClick={limpiar} leftIcon={<X aria-hidden="true" />}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {cargando && (
        <div className="space-y-2" aria-busy="true" aria-label="Cargando órdenes">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {datos && lista.length === 0 && !error && (
        <Card>
          <CardContent>
            {hayFiltros ? (
              <EstadoVacio titulo="No hay órdenes con estos filtros" descripcion="Prueba con otro estado o quita algún filtro." icono={ReceiptText} accion={{ texto: "Limpiar filtros", onClick: limpiar }} />
            ) : (
              <EstadoVacio titulo="Aún no tienes órdenes" descripcion="Cuando tus clientes compren, aparecerán aquí. Comparte el enlace de tu tienda para recibir la primera." icono={ReceiptText} />
            )}
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
                  <TableHead className="pl-6">Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Preparación</TableHead>
                  <TableHead className="pr-6 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => router.push(`/panel/ordenes/${o.id}`)}>
                    <TableCell className="pl-6 font-mono text-[12.5px] font-bold">
                      <Link href={`/panel/ordenes/${o.id}`} className="text-brand-text hover:underline" onClick={(e) => e.stopPropagation()}>
                        {o.numero_orden}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] truncate text-[13px] font-bold text-foreground">{o.nombre_cliente}</p>
                      <p className="max-w-[200px] truncate text-[12px] text-muted-foreground">{o.correo_cliente}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[12.5px] text-muted-foreground">{formatearFecha(o.fecha_creacion, zonaHoraria)}</TableCell>
                    <TableCell><Badge variant="estado" tono={ETIQUETA_ESTADO[o.estado].tono}>{ETIQUETA_ESTADO[o.estado].texto}</Badge></TableCell>
                    <TableCell><Badge variant="estado" tono={ETIQUETA_PAGO[o.estado_pago].tono}>{ETIQUETA_PAGO[o.estado_pago].texto}</Badge></TableCell>
                    <TableCell><Badge variant="estado" tono={ETIQUETA_PREPARACION[o.estado_preparacion].tono}>{ETIQUETA_PREPARACION[o.estado_preparacion].texto}</Badge></TableCell>
                    <TableCell className="pr-6 text-right text-[14px] font-extrabold">{formatearDinero(o.total, o.moneda)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Móvil: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {lista.map((o) => (
              <li key={o.id}>
                <Link href={`/panel/ordenes/${o.id}`} className="block rounded-xl border border-island-border bg-card p-4 shadow-isla outline-none transition-all active:scale-[0.99] focus-visible:ring-[3px] focus-visible:ring-ring/25">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] font-extrabold text-brand-text">{o.numero_orden}</p>
                      <p className="truncate text-[13px] font-bold text-foreground">{o.nombre_cliente}</p>
                      <p className="text-[12px] text-muted-foreground">{formatearFecha(o.fecha_creacion, zonaHoraria)}</p>
                    </div>
                    <p className="shrink-0 text-[15px] font-extrabold text-foreground">{formatearDinero(o.total, o.moneda)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="estado" tono={ETIQUETA_ESTADO[o.estado].tono}>{ETIQUETA_ESTADO[o.estado].texto}</Badge>
                    <Badge variant="estado" tono={ETIQUETA_PAGO[o.estado_pago].tono}>{ETIQUETA_PAGO[o.estado_pago].texto}</Badge>
                    <Badge variant="estado" tono={ETIQUETA_PREPARACION[o.estado_preparacion].tono}>{ETIQUETA_PREPARACION[o.estado_preparacion].texto}</Badge>
                  </div>
                </Link>
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
          etiqueta="órdenes"
          onCambiar={(numero) => setPagina(numero - 1)}
        />
      )}
    </div>
  )
}

function CampoSelect({ etiqueta, valor, opciones, onCambiar }: { etiqueta: string; valor: string; opciones: [string, string][]; onCambiar: (valor: string) => void }) {
  return (
    <label className="block space-y-1.5 text-[12px]">
      <span className="font-bold text-muted-foreground">{etiqueta}</span>
      <select className="h-11 w-full cursor-pointer rounded-xl border-[1.8px] border-input bg-transparent px-3 text-[13px] font-medium text-foreground outline-none hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18" value={valor} onChange={(e) => onCambiar(e.target.value)}>
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
    <label className="block space-y-1.5 text-[12px]">
      <span className="font-bold text-muted-foreground">{etiqueta}</span>
      <input type="date" className="h-11 w-full rounded-xl border-[1.8px] border-input bg-transparent px-3 text-[13px] font-medium text-foreground outline-none hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18" value={valor ?? ""} onChange={(e) => onCambiar(e.target.value || undefined)} />
    </label>
  )
}
