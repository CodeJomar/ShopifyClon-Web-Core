"use client"

import * as React from "react"
import { Banknote, Coins, Wallet } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { rangoUltimosDias } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { metricasAction } from "../actions/metricas.actions"
import { GraficoVentas } from "../components/grafico-ventas"
import { TarjetaMetrica } from "../components/tarjeta-metrica"
import type { MetricasDto } from "@/dtos/metricas"
import type { ErrorApi } from "@/lib/api/error-api"

const RANGOS = [
  { dias: 1, etiqueta: "Hoy" },
  { dias: 7, etiqueta: "7 días" },
  { dias: 30, etiqueta: "30 días" },
] as const

/** Inicio del panel: métricas de la tienda activa en el rango elegido (por defecto, 30 días). */
export function InicioView() {
  const { tienda } = usePanel()
  const [dias, setDias] = React.useState<(typeof RANGOS)[number]["dias"]>(30)
  const [datos, setDatos] = React.useState<MetricasDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

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
  }, [dias])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Inicio</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Cómo va tu tienda. Los montos están en {moneda}.</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Rango de fechas">
          {RANGOS.map((rango) => (
            <Button key={rango.dias} size="sm" variant={dias === rango.dias ? "default" : "neutral"} aria-pressed={dias === rango.dias} onClick={() => setDias(rango.dias)}>
              {rango.etiqueta}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las métricas</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando métricas…
        </p>
      )}

      {datos && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaMetrica titulo="Ventas netas" valor={formatearDinero(ventasNetas, moneda)} ayuda="En el rango elegido" icono={<Banknote className="size-4" />} />
            <TarjetaMetrica titulo="Ventas históricas" valor={formatearDinero(datos.resumen.ventas_historicas, moneda)} ayuda="Desde que abriste tu tienda" icono={<Wallet className="size-4" />} />
            <TarjetaMetrica titulo="Saldo por cobrar" valor={formatearDinero(datos.resumen.saldo_por_cobrar, moneda)} ayuda="Pendiente de liberar" icono={<Coins className="size-4" />} />
            <TarjetaMetrica titulo="Comisiones" valor={formatearDinero(datos.resumen.comisiones, moneda)} ayuda="Comisión de la plataforma" />
          </div>

          {sinVentas ? (
            <Card>
              <CardContent>
                <EstadoVacio
                  titulo="Aún no tienes ventas"
                  descripcion={`Comparte tu tienda para empezar: ${enlace}`}
                  accion={{ texto: "Copiar enlace", onClick: copiarEnlace }}
                />
              </CardContent>
            </Card>
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
                </CardHeader>
                <CardContent>
                  {datos.top_productos.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">Aún no hay productos vendidos en este rango.</p>
                  ) : (
                    <ol className="space-y-3">
                      {datos.top_productos.map((producto) => (
                        <li key={producto.variante_id} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-foreground">{producto.titulo_producto}</p>
                            {producto.titulo_variante && <p className="truncate text-[12px] text-muted-foreground">{producto.titulo_variante}</p>}
                            <p className="text-[12px] text-muted-foreground">{producto.unidades} u.</p>
                          </div>
                          <p className="shrink-0 text-[13px] font-bold text-foreground">{formatearDinero(producto.importe, moneda)}</p>
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
