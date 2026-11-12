"use client"

import * as React from "react"
import { Banknote, Coins, Copy, ExternalLink, Percent, Wallet, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { rangoUltimosDias } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { useEstadoEnVivo, useEventosOrdenes } from "@/modules/panel/context/tiempo-real"
import { IndicadorEnVivo } from "@/shared/components/composed/indicador-en-vivo"
import { metricasAction } from "../actions/metricas.actions"
import { GraficoVentas } from "../components/grafico-ventas"
import { TarjetaMetrica } from "../components/tarjeta-metrica"
import { PrimerosPasos } from "../components/primeros-pasos"
import type { MetricasDto } from "@/dtos/metricas"
import type { ErrorApi } from "@/lib/api/error-api"

const RANGOS = [
  { dias: 1, etiqueta: "Hoy" },
  { dias: 7, etiqueta: "7 días" },
  { dias: 30, etiqueta: "30 días" },
] as const

/** Inicio del panel: métricas de la tienda activa en el rango elegido (por defecto, 30 días). */
export function InicioView() {
  const { tienda, nombres, puede } = usePanel()
  const [dias, setDias] = React.useState<(typeof RANGOS)[number]["dias"]>(30)
  const [datos, setDatos] = React.useState<MetricasDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  // Tiempo real (W-022): una orden nueva o pagada cambia las métricas, así que se vuelven a pedir.
  const [version, setVersion] = React.useState(0)
  useEventosOrdenes(() => setVersion((v) => v + 1))
  const estadoEnVivo = useEstadoEnVivo()

  React.useEffect(() => {
    let cancelado = false
    const { fecha_inicio, fecha_fin } = rangoUltimosDias(dias)
    metricasAction(fecha_inicio, fecha_fin).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [dias, version])

  const moneda = datos?.moneda ?? tienda?.moneda ?? "PEN"
  const ventasNetas = datos?.por_dia.reduce((total, dia) => total + dia.ventas_netas, 0) ?? 0
  const sinVentas = datos !== null && ventasNetas === 0 && (datos.top_productos.length === 0)
  const enlace = tienda ? `otemu.com/tienda/${tienda.subdominio}` : ""

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(enlace)
      toast.add({ type: "success", title: "Enlace copiado", description: enlace })
    } catch {
      toast.add({ type: "error", title: "No se pudo copiar", description: "Copia el enlace manualmente." })
    }
  }

  const maxImporte = Math.max(1, ...(datos?.top_productos.map((p) => p.importe) ?? [0]))

  return (
    <div className="otemu-dashboard space-y-6">
      <section className="otemu-dashboard-intro">
        <div className="otemu-dashboard-intro-inner">
          <span className="otemu-eyebrow"><Sparkles aria-hidden="true" className="size-3.5" /> TU ESPACIO DE TRABAJO</span>
          <p className="otemu-dashboard-intro-note">Una mirada clara a lo que importa: tu negocio.</p>
        </div>
      <EncabezadoPagina
        titulo={nombres ? `Hola, ${nombres.split(/\s+/)[0]}` : "Dashboard"}
        descripcion={`Así va ${tienda?.nombre ?? "tu tienda"}. Los montos están en ${moneda}.`}
        acciones={
          <div className="flex flex-wrap items-center gap-3">
            <IndicadorEnVivo estado={estadoEnVivo} />
            <ControlSegmentado
              aria-label="Rango de fechas"
              valor={dias}
              onCambiar={setDias}
              opciones={RANGOS.map((rango) => ({ valor: rango.dias, etiqueta: rango.etiqueta }))}
            />
          </div>
        }
      />
      </section>

      {tienda && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-isla">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Enlace de tu tienda</p>
            <p className="truncate font-mono text-[13px] font-medium text-foreground">{enlace}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" size="sm" onClick={copiarEnlace} leftIcon={<Copy aria-hidden="true" />}>
              Copiar
            </Button>
            <Link href={`/tienda/${tienda.subdominio}`} target="_blank" rel="noopener" className={buttonVariants({ variant: "neutral", size: "sm" })}>
              <ExternalLink aria-hidden="true" />
              Ver tienda
            </Link>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las métricas</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Cargando métricas">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {datos && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaMetrica destacada titulo="Ventas netas" valor={formatearDinero(ventasNetas, moneda)} ayuda="En el rango elegido" icono={<Banknote className="size-4.5" />} />
            <TarjetaMetrica titulo="Ventas históricas" valor={formatearDinero(datos.resumen.ventas_historicas, moneda)} ayuda="Desde que abriste tu tienda" icono={<Wallet className="size-4.5" />} />
            <TarjetaMetrica titulo="Saldo por cobrar" valor={formatearDinero(datos.resumen.saldo_por_cobrar, moneda)} ayuda="Pendiente de liberar" icono={<Coins className="size-4.5" />} />
            <TarjetaMetrica titulo="Comisiones" valor={formatearDinero(datos.resumen.comisiones, moneda)} ayuda="Comisión de la plataforma" icono={<Percent className="size-4.5" />} />
          </div>

          {sinVentas ? (
            <PrimerosPasos puede={puede} onCopiarEnlace={copiarEnlace} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Ventas por día</CardTitle>
                  <CardDescription>Ventas netas de cada día del rango.</CardDescription>
                </CardHeader>
                <CardContent>
                  <GraficoVentas dias={datos.por_dia} moneda={moneda} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Más vendidos</CardTitle>
                  <CardDescription>Los productos que más ingresos dejaron en el rango.</CardDescription>
                </CardHeader>
                <CardContent>
                  {datos.top_productos.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">Aún no hay productos vendidos en este rango.</p>
                  ) : (
                    <ol className="space-y-4">
                      {datos.top_productos.map((producto, indice) => (
                        <li key={producto.variante_id} className="space-y-1.5">
                          <div className="flex items-start gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/14 text-[11px] font-extrabold text-brand-text">{indice + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-bold text-foreground">{producto.titulo_producto}</p>
                              <p className="truncate text-[12px] text-muted-foreground">
                                {producto.titulo_variante ? `${producto.titulo_variante} · ` : ""}
                                {producto.unidades} u.
                              </p>
                            </div>
                            <p className="shrink-0 text-[13px] font-bold text-foreground">{formatearDinero(producto.importe, moneda)}</p>
                          </div>
                          <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.round((producto.importe / maxImporte) * 100))}%` }} />
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
