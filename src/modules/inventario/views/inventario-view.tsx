"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { SearchInput } from "@/shared/components/composed/search-input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Boxes, History, ImageOff, Settings2, SlidersHorizontal } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { toast } from "@/shared/components/ui/toast"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import { productoAction, productosAction } from "@/modules/catalogo/actions/catalogo.actions"
import type { ProductoDetalleDto, ProductoListaDto, VarianteDto } from "@/dtos/catalogo"
import type { StockVarianteDto } from "@/dtos/inventario"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { ErrorApi } from "@/lib/api/error-api"
import { stockVarianteAction } from "../actions/inventario.actions"
import { AjustarStockForm } from "../components/ajustar-stock-form"
import { ConfigurarStockForm } from "../components/configurar-stock-form"
import { MovimientosVariante } from "../components/movimientos-variante"

const FORM_AJUSTE = "formulario-ajuste-stock"
const FORM_CONFIGURACION = "formulario-configuracion-stock"

type PanelInventario = { tipo: "ajustar" | "configurar" | "historial"; variante: VarianteDto }

const TITULO_PANEL: Record<PanelInventario["tipo"], string> = {
  ajustar: "Ajustar stock",
  configurar: "Configurar inventario",
  historial: "Historial de movimientos",
}

/** Inventario por variante: buscar un producto, ver el stock de sus variantes, ajustar, configurar y ver el historial. */
export function InventarioView() {
  const { tienda, puede } = usePanel()
  const puedeVer = puede(PERMISO.CATALOGO_GESTIONAR) || puede(PERMISO.INVENTARIO_AJUSTAR)
  const puedeAjustar = puede(PERMISO.INVENTARIO_AJUSTAR)
  const [texto, setTexto] = React.useState("")
  const [textoAplicado, setTextoAplicado] = React.useState("")
  const [pagina, setPagina] = React.useState(0)
  const [datos, setDatos] = React.useState<Paginado<ProductoListaDto> | null>(null)
  const [productoId, setProductoId] = React.useState<string | null>(null)
  const [producto, setProducto] = React.useState<ProductoDetalleDto | null>(null)
  const [stocks, setStocks] = React.useState<Record<string, StockVarianteDto>>({})
  const [panel, setPanel] = React.useState<PanelInventario | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    if (!puedeVer) return
    let cancelado = false
    productosAction(pagina, { texto: textoAplicado.trim() || undefined }).then((res) => {
      if (cancelado) return
      if (res.ok) setDatos(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [puedeVer, pagina, textoAplicado])

  // La búsqueda espera a que termines de escribir
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPagina(0)
      setTextoAplicado(texto)
    }, 350)
    return () => clearTimeout(t)
  }, [texto])

  const cargarStocks = async (variantes: VarianteDto[]) => {
    const resultados = await Promise.all(variantes.map((v) => stockVarianteAction(v.id)))
    const mapa: Record<string, StockVarianteDto> = {}
    resultados.forEach((r) => {
      if (r.ok) mapa[r.datos.variante_id] = r.datos
      else setError(r.error)
    })
    setStocks(mapa)
  }

  const seleccionar = async (id: string) => {
    setError(null)
    setProductoId(id)
    const res = await productoAction(id)
    if (!res.ok) return setError(res.error)
    setProducto(res.datos)
    await cargarStocks(res.datos.variantes)
  }

  // Tras guardar se vuelve a leer el stock de la variante: la respuesta del PUT no siempre trae la forma de StockVarianteDto.
  const alGuardar = async (varianteId: string, mensaje: string) => {
    setPanel(null)
    toast.add({ type: "success", title: mensaje })
    const res = await stockVarianteAction(varianteId)
    if (res.ok) setStocks((s) => ({ ...s, [varianteId]: res.datos }))
    else setError(res.error)
  }

  if (!puedeVer) {
    return <EstadoVacio titulo="No tienes acceso al inventario" descripcion="Pide a quien administra la tienda que te dé permiso." />
  }

  const lista = datos?.datos ?? []

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Inventario" descripcion="Stock por variante: elige un producto a la izquierda para ver, ajustar y revisar su historial." />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,360px)_1fr]">
        {/* Productos */}
        <Card className="gap-0 py-0">
          <div className="border-b border-border/60 p-4">
            <SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar producto" />
          </div>
          {!datos && !error && (
            <div className="space-y-2 p-4" aria-busy="true" aria-label="Cargando productos">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          )}
          {datos && lista.length === 0 && (
            <div className="p-4">
              <EstadoVacio icono={Boxes} titulo="Sin productos" descripcion={textoAplicado ? "Ningún producto coincide con la búsqueda." : "Crea un producto en Productos para ver su inventario."} />
            </div>
          )}
          <ul className="max-h-[560px] divide-y divide-border/60 overflow-y-auto">
            {lista.map((p) => {
              const activo = productoId === p.id
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => seleccionar(p.id)}
                    aria-current={activo ? "true" : undefined}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition-colors focus-visible:bg-primary/10",
                      activo ? "bg-primary/10 shadow-[inset_3px_0_0_var(--primary)]" : "hover:bg-muted/60",
                    )}
                  >
                    <span className="block size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.imagen_principal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imagen_principal} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="flex size-full items-center justify-center text-muted-foreground"><ImageOff className="size-4" aria-hidden="true" /></span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-foreground">{p.titulo}</span>
                      <span className="block text-[12px] text-muted-foreground">{p.numero_variantes} {p.numero_variantes === 1 ? "variante" : "variantes"}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {datos && datos.total_paginas > 1 && (
            <div className="border-t border-border/60 px-4">
              <BarraPaginacion
                pagina={datos.pagina_actual + 1}
                totalPaginas={Math.max(1, datos.total_paginas)}
                total={datos.total}
                porPagina={datos.tamano_pagina}
                etiqueta="productos"
                onCambiar={(numero) => setPagina(numero - 1)}
              />
            </div>
          )}
        </Card>

        {/* Variantes del producto elegido */}
        {!producto ? (
          <Card>
            <CardContent>
              <EstadoVacio icono={Boxes} titulo="Elige un producto" descripcion="Verás el stock de cada variante y podrás ajustarlo." />
            </CardContent>
          </Card>
        ) : (
          <Card className="gap-0 py-0">
            <div className="border-b border-border/60 p-5">
              <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">{producto.titulo}</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">{producto.variantes.length} {producto.variantes.length === 1 ? "variante" : "variantes"}</p>
            </div>
            <ul className="divide-y divide-border/60">
              {producto.variantes.map((v) => {
                const stock = stocks[v.id]
                const agotado = Boolean(stock && stock.rastrea_inventario && stock.vendible <= 0 && !stock.permitir_venta_sin_stock)
                return (
                  <li key={v.id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-extrabold text-foreground">{v.titulo}</span>
                      <span className="font-mono text-[12px] text-muted-foreground">{v.sku}</span>
                      {stock && !stock.rastrea_inventario && <Badge variant="estado" tono="neutro">Sin rastreo</Badge>}
                      {stock?.permitir_venta_sin_stock && <Badge variant="estado" tono="aviso">Vende sin stock</Badge>}
                      {agotado && <Badge variant="estado" tono="peligro">Agotado</Badge>}
                    </div>
                    {stock ? (
                      <dl className="grid grid-cols-3 gap-3">
                        {[["Disponible", stock.disponible], ["Reservado", stock.reservada], ["Vendible", stock.vendible]].map(([etiqueta, valor]) => (
                          <div key={String(etiqueta)} className="rounded-xl bg-muted/50 px-3 py-2.5">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{etiqueta}</dt>
                            <dd className={cn("mt-0.5 text-[20px] font-extrabold leading-none", etiqueta === "Vendible" && agotado ? "text-destructive-text" : "text-foreground")}>{valor}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <Skeleton className="h-[58px] rounded-xl" />
                    )}
                    <div className="flex flex-wrap gap-2">
                      {puedeAjustar && (
                        <Button variant="soft" size="sm" disabled={!stock} onClick={() => setPanel({ tipo: "ajustar", variante: v })} leftIcon={<SlidersHorizontal aria-hidden="true" />}>
                          Ajustar stock
                        </Button>
                      )}
                      {puedeAjustar && (
                        <Button variant="neutral" size="sm" disabled={!stock} onClick={() => setPanel({ tipo: "configurar", variante: v })} leftIcon={<Settings2 aria-hidden="true" />}>
                          Configurar
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setPanel({ tipo: "historial", variante: v })} leftIcon={<History aria-hidden="true" />}>
                        Historial
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
      </div>

      <FormPanel
        open={panel !== null}
        onOpenChange={(abierto) => !abierto && setPanel(null)}
        title={panel ? TITULO_PANEL[panel.tipo] : ""}
        description={panel?.variante.sku}
        footer={
          panel?.tipo === "historial" ? (
            <Button type="button" variant="neutral" onClick={() => setPanel(null)}>Cerrar</Button>
          ) : (
            <>
              <Button type="button" variant="neutral" onClick={() => setPanel(null)}>Cancelar</Button>
              <Button type="submit" form={panel?.tipo === "ajustar" ? FORM_AJUSTE : FORM_CONFIGURACION}>Guardar</Button>
            </>
          )
        }
      >
        {panel?.tipo === "ajustar" && stocks[panel.variante.id] && (
          <AjustarStockForm
            key={panel.variante.id}
            formId={FORM_AJUSTE}
            stock={stocks[panel.variante.id]}
            onGuardado={() => alGuardar(panel.variante.id, "Stock ajustado")}
          />
        )}
        {panel?.tipo === "configurar" && stocks[panel.variante.id] && (
          <ConfigurarStockForm
            key={panel.variante.id}
            formId={FORM_CONFIGURACION}
            stock={stocks[panel.variante.id]}
            onGuardado={() => alGuardar(panel.variante.id, "Configuración guardada")}
          />
        )}
        {panel?.tipo === "historial" && <MovimientosVariante varianteId={panel.variante.id} zonaHoraria={tienda?.zona_horaria} />}
      </FormPanel>
    </div>
  )
}
