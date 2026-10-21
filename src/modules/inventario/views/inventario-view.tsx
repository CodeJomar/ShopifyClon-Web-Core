"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { FloatingInput } from "@/shared/components/composed/floating-input"
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
    productosAction(pagina, { texto: texto.trim() || undefined }).then((res) => {
      if (cancelado) return
      if (res.ok) setDatos(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [puedeVer, pagina, texto])

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

  const alGuardar = (stock: StockVarianteDto, mensaje: string) => {
    setStocks((s) => ({ ...s, [stock.variante_id]: stock }))
    setPanel(null)
    toast.add({ type: "success", title: mensaje })
  }

  if (!puedeVer) {
    return <EstadoVacio titulo="No tienes acceso al inventario" descripcion="Pide a quien administra la tienda que te dé permiso." />
  }

  const lista = datos?.datos ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Inventario</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Stock por variante. Elige un producto para ver sus variantes.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FloatingInput
            label="Buscar por título"
            value={texto}
            onChange={(e) => {
              setPagina(0)
              setTexto(e.target.value)
            }}
          />
          {datos && lista.length === 0 && <EstadoVacio titulo="Sin productos" descripcion="Crea un producto en Catálogo para ver su inventario." />}
          <ul className="divide-y divide-border">
            {lista.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{p.titulo}</p>
                  <p className="text-[12px] text-muted-foreground">{p.numero_variantes} variante(s)</p>
                </div>
                <Button variant={productoId === p.id ? "default" : "outline"} size="sm" onClick={() => seleccionar(p.id)}>
                  Ver inventario
                </Button>
              </li>
            ))}
          </ul>
          {datos && datos.total_paginas > 0 && (
            <BarraPaginacion
              pagina={datos.pagina_actual + 1}
              totalPaginas={Math.max(1, datos.total_paginas)}
              total={datos.total}
              porPagina={datos.tamano_pagina}
              etiqueta="productos"
              onCambiar={(numero) => setPagina(numero - 1)}
            />
          )}
        </CardContent>
      </Card>

      {producto && (
        <Card>
          <CardHeader>
            <CardTitle>{producto.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {producto.variantes.map((v) => {
                const stock = stocks[v.id]
                return (
                  <li key={v.id} className="space-y-2 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold">{v.titulo}</span>
                      <span className="font-mono text-[12px] text-muted-foreground">{v.sku}</span>
                      {stock && !stock.rastrea_inventario && <Badge variant="estado" tono="neutro">Sin rastreo</Badge>}
                      {stock?.permitir_venta_sin_stock && <Badge variant="estado" tono="aviso">Vende sin stock</Badge>}
                    </div>
                    <p className="text-[13px]">
                      {stock
                        ? `Disponible: ${stock.disponible} · Reservado: ${stock.reservada} · Vendible: ${stock.vendible}`
                        : "Cargando stock…"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {puedeAjustar && (
                        <Button variant="outline" size="sm" disabled={!stock} onClick={() => setPanel({ tipo: "ajustar", variante: v })}>
                          Ajustar
                        </Button>
                      )}
                      {puedeAjustar && (
                        <Button variant="outline" size="sm" disabled={!stock} onClick={() => setPanel({ tipo: "configurar", variante: v })}>
                          Configurar
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setPanel({ tipo: "historial", variante: v })}>
                        Historial
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

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
            onGuardado={(s) => alGuardar(s, "Stock ajustado")}
          />
        )}
        {panel?.tipo === "configurar" && stocks[panel.variante.id] && (
          <ConfigurarStockForm
            key={panel.variante.id}
            formId={FORM_CONFIGURACION}
            stock={stocks[panel.variante.id]}
            onGuardado={(s) => alGuardar(s, "Configuración guardada")}
          />
        )}
        {panel?.tipo === "historial" && <MovimientosVariante varianteId={panel.variante.id} zonaHoraria={tienda?.zona_horaria} />}
      </FormPanel>
    </div>
  )
}
