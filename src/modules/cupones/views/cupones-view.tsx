"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import type { CuponDto } from "@/dtos/cupon"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { ErrorApi } from "@/lib/api/error-api"
import { cuponesAction, eliminarCuponAction, type FiltrosCupones } from "../actions/cupones.actions"
import { CuponForm, FORMULARIO_CUPON } from "../components/cupon-form"

const FILTRO_TODOS = "todos"

export function CuponesView() {
  const { tienda, puede } = usePanel()
  const puedeEscribir = puede(PERMISO.CUPONES_GESTIONAR)
  const moneda = tienda?.moneda ?? "PEN"
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"
  const confirmar = useConfirm()

  const [pagina, setPagina] = React.useState(0)
  const [texto, setTexto] = React.useState("")
  const [estado, setEstado] = React.useState<string>(FILTRO_TODOS)
  const [datos, setDatos] = React.useState<Paginado<CuponDto> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [panel, setPanel] = React.useState<{ abierto: boolean; editando?: CuponDto }>({ abierto: false })

  const activoFiltro = estado === FILTRO_TODOS ? undefined : estado === "activos"
  const filtros: FiltrosCupones = {
    texto: texto.trim() || undefined,
    activo: activoFiltro,
  }
  const filtrosClave = JSON.stringify(filtros)

  const cargar = React.useCallback(async () => {
    const filtrosActuales = JSON.parse(filtrosClave) as FiltrosCupones
    const res = await cuponesAction(pagina, filtrosActuales)
    if (res.ok) {
      setError(null)
      setDatos(res.datos)
    } else {
      setError(res.error)
    }
  }, [pagina, filtrosClave])

  React.useEffect(() => {
    let cancelado = false
    const filtrosActuales = JSON.parse(filtrosClave) as FiltrosCupones
    cuponesAction(pagina, filtrosActuales).then((res) => {
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
  }, [pagina, filtrosClave])

  const eliminar = async (cupon: CuponDto) => {
    const aceptado = await confirmar({
      variant: "destructive",
      title: "¿Eliminar este cupón?",
      description: `Se eliminará el cupón «${cupon.codigo}». Los clientes ya no podrán aplicarlo en el carrito.`,
      confirmText: "Sí, eliminar",
    })
    if (!aceptado) return
    const res = await eliminarCuponAction(cupon.id)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: "Cupón eliminado" })
    cargar()
  }

  const lista = datos?.datos ?? []
  const hayFiltros = texto.trim() !== "" || estado !== FILTRO_TODOS

  const formatearDescuento = (cupon: CuponDto) => {
    switch (cupon.tipo_descuento) {
      case "PORCENTAJE":
        return `${cupon.valor_descuento} %`
      case "MONTO_FIJO":
        return formatearDinero(cupon.valor_descuento, moneda)
      case "ENVIO_GRATIS":
        return "Envío gratis"
      default:
        return String(cupon.valor_descuento)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Cupones</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Crea códigos de descuento para tus compradores y campañas promocionales.</p>
        </div>
        {puedeEscribir && (
          <Button onClick={() => setPanel({ abierto: true, editando: undefined })}>Crear cupón</Button>
        )}
      </div>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FloatingInput
            label="Buscar por código"
            value={texto}
            onChange={(e) => {
              setPagina(0)
              setTexto(e.target.value)
            }}
          />
          <FloatingSelect
            label="Estado"
            value={estado}
            onValueChange={(v) => {
              setPagina(0)
              setEstado(String(v))
            }}
          >
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
            </SelectContent>
          </FloatingSelect>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar los cupones</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando cupones…
        </p>
      )}

      {datos && lista.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              titulo={hayFiltros ? "Ningún cupón coincide con el filtro" : "Aún no tienes cupones"}
              descripcion={
                hayFiltros
                  ? "Prueba con otro texto o quita los filtros."
                  : "Crea tu primer cupón para ofrecer descuentos a tus clientes."
              }
              accion={
                !hayFiltros && puedeEscribir
                  ? { texto: "Crear cupón", onClick: () => setPanel({ abierto: true, editando: undefined }) }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {datos && lista.length > 0 && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2">
            {lista.map((cupon) => (
              <li key={cupon.id}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-mono text-[16px] tracking-wide text-foreground">
                        {cupon.codigo}
                      </CardTitle>
                      <Badge variant="estado" tono={cupon.esta_activo ? "marca" : "contorno"}>
                        {cupon.esta_activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="text-[13px] font-semibold text-primary">
                      {formatearDescuento(cupon)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-[12.5px] text-muted-foreground">
                      <p>
                        {cupon.monto_minimo_compra != null && cupon.monto_minimo_compra > 0
                          ? `Compra mínima: ${formatearDinero(cupon.monto_minimo_compra, moneda)}`
                          : "Sin compra mínima"}
                      </p>
                      <p>
                        {cupon.limite_usos_total != null
                          ? `${cupon.cantidad_usos_actual} / ${cupon.limite_usos_total} usos`
                          : `${cupon.cantidad_usos_actual} usos (sin límite)`}
                      </p>
                      <p>
                        {cupon.fecha_fin
                          ? `${formatearFecha(cupon.fecha_inicio, zonaHoraria)} – ${formatearFecha(cupon.fecha_fin, zonaHoraria)}`
                          : `Desde ${formatearFecha(cupon.fecha_inicio, zonaHoraria)}`}
                      </p>
                    </div>

                    {puedeEscribir && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="neutral"
                          onClick={() => setPanel({ abierto: true, editando: cupon })}
                        >
                          Editar
                        </Button>
                        <Button size="sm" variant="danger-outline" onClick={() => eliminar(cupon)}>
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <BarraPaginacion
            pagina={datos.pagina_actual + 1}
            totalPaginas={Math.max(1, datos.total_paginas)}
            total={datos.total}
            porPagina={datos.tamano_pagina}
            etiqueta="cupones"
            onCambiar={(n) => setPagina(n - 1)}
          />
        </>
      )}

      <FormPanel
        open={panel.abierto}
        onOpenChange={(abierto) => setPanel((estadoPrevio) => ({ ...estadoPrevio, abierto }))}
        title={panel.editando ? "Editar cupón" : "Crear cupón"}
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setPanel({ abierto: false })}>
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_CUPON}>
              Guardar
            </Button>
          </>
        }
      >
        <CuponForm
          key={panel.editando?.id ?? "nuevo"}
          inicial={panel.editando}
          onGuardado={() => {
            setPanel({ abierto: false })
            cargar()
          }}
        />
      </FormPanel>
    </div>
  )
}
