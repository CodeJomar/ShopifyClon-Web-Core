"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowRight, Banknote, ExternalLink, PackageCheck, Plus, ShoppingBag, Store, TrendingUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { fijarTiendaAction, misTiendasAction } from "@/modules/tienda/actions/tienda.actions"
import type { MiTiendaDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ResumenPropietario, TiendaResumenPropietario } from "@/dtos/administracion"

const ROL: Record<string, string> = { PROPIETARIO: "Propietario", ADMINISTRADOR: "Administrador", GESTOR_CATALOGO: "Gestor de catálogo", GESTOR_PEDIDOS: "Gestor de pedidos" }

/**
 * Resumen de TODAS las tiendas de las que la persona es propietaria (B7: `GET /propietario/resumen`, últimos 30 días). Los totales
 * van por moneda porque monedas distintas no se suman. El rol sale de `/cuenta/tiendas`. Desde aquí se entra al panel de una tienda.
 */
export function PanelGeneralView() {
  const router = useRouter()
  const [tiendas, setTiendas] = React.useState<MiTiendaDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [abriendo, setAbriendo] = React.useState<string | null>(null)
  const [resumen, setResumen] = React.useState<ResumenPropietario | null>(null)

  React.useEffect(() => {
    let cancelado = false
    misTiendasAction().then((res) => {
      if (cancelado) return
      if (res.ok) setTiendas(res.datos)
      else setError(res.error)
    })
    void resultado(peticionApi<ResumenPropietario>({ method: "GET", url: "/propietario/resumen" })).then((res) => {
      if (cancelado) return
      if (res.ok) setResumen(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const abrirPanel = async (t: MiTiendaDto) => {
    setAbriendo(t.tienda_id)
    const res = await fijarTiendaAction(t.tienda_id)
    if (!res.ok) {
      setAbriendo(null)
      return setError(res.error)
    }
    router.push("/panel")
  }

  const metricas = new Map((resumen?.tiendas ?? []).map((t) => [t.tienda_id, t]))
  const filas = (tiendas ?? []).map((t) => ({ tienda: t, m: metricas.get(t.tienda_id) }))
  const totales = resumen?.totales ?? []
  const pedidos = totales.reduce((s, t) => s + t.ordenes, 0)
  const mayorPorMoneda = new Map<string, number>()
  for (const t of resumen?.tiendas ?? []) mayorPorMoneda.set(t.moneda, Math.max(mayorPorMoneda.get(t.moneda) ?? 1, t.ventas))
  const alertas = (resumen?.tiendas ?? []).flatMap((t: TiendaResumenPropietario) => [
    ...(t.alertas.ordenes_por_preparar > 0 ? [{ id: `${t.tienda_id}-d`, texto: `${t.alertas.ordenes_por_preparar} ${t.alertas.ordenes_por_preparar === 1 ? "pedido por preparar" : "pedidos por preparar"} en ${t.nombre}` }] : []),
    ...(t.alertas.stock_bajo > 0 ? [{ id: `${t.tienda_id}-s`, texto: `${t.alertas.stock_bajo} ${t.alertas.stock_bajo === 1 ? "producto con poco stock" : "productos con poco stock"} en ${t.nombre}` }] : []),
  ])

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Panel general"
        descripcion={tiendas && tiendas.length > 0 ? `Así van tus ${tiendas.length} ${tiendas.length === 1 ? "tienda" : "tiendas"} en los últimos 30 días.` : "El resumen de todas tus tiendas."}
        acciones={
          <Link href="/cuenta/tiendas/nueva" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus aria-hidden="true" /> Nueva tienda
          </Link>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar tus tiendas</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {(!tiendas || !resumen) && !error && (
        <div className="grid gap-4 sm:grid-cols-3" aria-busy="true" aria-label="Cargando tus tiendas">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {tiendas && tiendas.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={Store}
              titulo="Todavía no tienes una tienda"
              descripcion="Empieza gratis: elige un plan, ponle nombre a tu tienda y publica tu primer producto."
              accion={{ texto: "Ver los planes", onClick: () => router.push("/planes") }}
            />
          </CardContent>
        </Card>
      )}

      {tiendas && tiendas.length > 0 && resumen && (
        <>
          <div data-tour="kpis" className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-primary p-6 text-sobre-marca md:col-span-1">
              <p className="flex items-center gap-2 text-[13px] font-bold">
                <TrendingUp aria-hidden="true" className="size-4" /> Ventas de todas tus tiendas
              </p>
              {totales.length === 0 ? (
                <p className="mt-3 text-[34px] font-extrabold leading-none tracking-tight">{formatearDinero(0, "PEN")}</p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {totales.map((t, i) => (
                    <li key={t.moneda} className={cn("font-extrabold leading-none tracking-tight", i === 0 ? "text-[34px]" : "text-[20px]")}>{formatearDinero(t.ventas, t.moneda)}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[12.5px] font-semibold">Ventas netas, últimos 30 días</p>
            </div>
            <Kpi icono={ShoppingBag} titulo="Pedidos" valor={String(pedidos)} detalle="entre todas las tiendas" />
            <Kpi icono={Banknote} titulo="Saldo por cobrar" valor={totales.length === 0 ? formatearDinero(0, "PEN") : totales.map((t) => formatearDinero(t.saldo_pendiente, t.moneda)).join(" · ")} detalle="tu parte, después de comisiones" />
          </div>

          <div data-tour="alertas" className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardContent className="space-y-4">
                <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Ventas por tienda</h2>
                <ul className="space-y-3.5">
                  {filas.map((f) => {
                    const ventas = f.m?.ventas ?? 0
                    const mayor = mayorPorMoneda.get(f.m?.moneda ?? "") ?? 1
                    return (
                      <li key={f.tienda.tienda_id}>
                        <div className="flex justify-between gap-3 text-[13.5px]">
                          <span className="truncate font-bold text-foreground">{f.tienda.nombre}</span>
                          <span className="font-extrabold text-foreground">{formatearDinero(ventas, f.m?.moneda ?? "PEN")}</span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${f.tienda.nombre}: ${Math.round((ventas / mayor) * 100)} % de la tienda que más vendió`}>
                          <div className="barra-reparto h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (ventas / mayor) * 100)}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Pendiente de atender</h2>
                {alertas.length === 0 ? (
                  <p className="flex items-center gap-2 text-[13.5px] font-medium text-muted-foreground">
                    <PackageCheck aria-hidden="true" className="size-4 text-brand-text" /> Todo al día: no hay pedidos por preparar ni stock bajo.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {alertas.map((a) => (
                      <li key={a.id} className="flex items-start gap-2.5 rounded-xl bg-warning/10 px-3.5 py-2.5 text-[13.5px] font-medium text-foreground">
                        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning-text" />
                        {a.texto}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <section aria-labelledby="tiendas-titulo" className="space-y-4">
            <h2 id="tiendas-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Tus tiendas</h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filas.map(({ tienda: t, m }) => (
                <li key={t.tienda_id}>
                  <Card className="h-full">
                    <CardContent className="flex h-full flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-extrabold tracking-tight text-foreground">{t.nombre}</p>
                          <p className="truncate font-mono text-[12px] text-muted-foreground">otemu.com/tienda/{t.subdominio}</p>
                        </div>
                        <Badge variant="estado" tono={t.operativa ? "marca" : "aviso"}>{t.operativa ? "Operativa" : "Suscripción vencida"}</Badge>
                      </div>
                      <dl className="grid grid-cols-3 gap-2 text-center">
                        <Dato titulo="Ventas" valor={formatearDinero(m?.ventas ?? 0, m?.moneda ?? "PEN").replace(/\.00$/, "")} />
                        <Dato titulo="Pedidos" valor={String(m?.ordenes ?? 0)} />
                        <Dato titulo="Plan" valor={m?.codigo_plan ?? "—"} />
                      </dl>
                      <p className="text-[12.5px] font-semibold text-muted-foreground">Tu rol: {ROL[t.rol] ?? t.rol}</p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <Button size="sm" loading={abriendo === t.tienda_id} onClick={() => abrirPanel(t)} rightIcon={<ArrowRight aria-hidden="true" />}>
                          Administrar
                        </Button>
                        <Link href={`/tienda/${t.subdominio}`} target="_blank" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                          Ver tienda <ExternalLink aria-hidden="true" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

function Kpi({ icono: Icono, titulo, valor, detalle }: { icono: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; titulo: string; valor: string; detalle: string }) {
  return (
    <div className="rounded-3xl border border-island-border bg-card p-6 shadow-isla">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        <Icono aria-hidden className="size-4 text-brand-text" /> {titulo}
      </p>
      <p className="mt-3 text-[30px] font-extrabold leading-none tracking-tight text-foreground">{valor}</p>
      <p className="mt-2 text-[12.5px] text-muted-foreground">{detalle}</p>
    </div>
  )
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-secondary px-2 py-2.5">
      <dt className="text-[11px] font-semibold text-muted-foreground">{titulo}</dt>
      <dd className="mt-0.5 truncate text-[14px] font-extrabold text-foreground">{valor}</dd>
    </div>
  )
}
