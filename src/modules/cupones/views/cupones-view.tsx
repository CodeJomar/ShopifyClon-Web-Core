"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { SearchInput } from "@/shared/components/composed/search-input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Copy, Pencil, Plus, Ticket, Trash2, X } from "lucide-react"
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
  const [textoAplicado, setTextoAplicado] = React.useState("")
  const [estado, setEstado] = React.useState<string>(FILTRO_TODOS)
  const [datos, setDatos] = React.useState<Paginado<CuponDto> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [panel, setPanel] = React.useState<{ abierto: boolean; editando?: CuponDto }>({ abierto: false })

  const activoFiltro = estado === FILTRO_TODOS ? undefined : estado === "activos"
  // La búsqueda espera a que termines de escribir
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPagina(0)
      setTextoAplicado(texto)
    }, 350)
    return () => clearTimeout(t)
  }, [texto])

  const filtros: FiltrosCupones = {
    texto: textoAplicado.trim() || undefined,
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

  const [ahora] = React.useState(() => Date.now())
  const lista = datos?.datos ?? []
  const hayFiltros = texto.trim() !== "" || estado !== FILTRO_TODOS
  const limpiar = () => {
    setTexto("")
    setTextoAplicado("")
    setEstado(FILTRO_TODOS)
    setPagina(0)
  }

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo)
      toast.add({ type: "success", title: "Código copiado", description: codigo })
    } catch {
      toast.add({ type: "error", title: "No se pudo copiar", description: "Copia el código manualmente." })
    }
  }

  /** Valor grande del cupón y su unidad, para el lado izquierdo del «ticket». */
  const descuento = (cupon: CuponDto): { valor: string; unidad: string } => {
    switch (cupon.tipo_descuento) {
      case "PORCENTAJE":
        return { valor: `${cupon.valor_descuento}%`, unidad: "de descuento" }
      case "MONTO_FIJO":
        return { valor: formatearDinero(cupon.valor_descuento, moneda), unidad: "de descuento" }
      case "ENVIO_GRATIS":
        return { valor: "Envío", unidad: "gratis" }
      default:
        return { valor: String(cupon.valor_descuento), unidad: "" }
    }
  }

  /** Vigencia según las fechas del cupón (el estado «activo» lo decide la persona; esto solo avisa si ya venció o aún no empieza). */
  const vigencia = (cupon: CuponDto): { texto: string; tono: "marca" | "contorno" | "aviso" | "peligro" } => {

    if (!cupon.esta_activo) return { texto: "Inactivo", tono: "contorno" }
    if (cupon.fecha_fin && new Date(cupon.fecha_fin).getTime() < ahora) return { texto: "Vencido", tono: "peligro" }
    if (new Date(cupon.fecha_inicio).getTime() > ahora) return { texto: "Programado", tono: "aviso" }
    return { texto: "Activo", tono: "marca" }
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Cupones"
        descripcion={datos ? `${datos.total} ${datos.total === 1 ? "cupón" : "cupones"}. Códigos de descuento para tus compradores y campañas.` : "Crea códigos de descuento para tus compradores y campañas promocionales."}
        acciones={
          puedeEscribir && (
            <Button onClick={() => setPanel({ abierto: true, editando: undefined })} leftIcon={<Plus aria-hidden="true" />}>
              Crear cupón
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <ControlSegmentado
              aria-label="Estado del cupón"
              valor={estado}
              onCambiar={(v) => { setPagina(0); setEstado(v) }}
              opciones={[{ valor: FILTRO_TODOS, etiqueta: "Todos" }, { valor: "activos", etiqueta: "Activos" }, { valor: "inactivos", etiqueta: "Inactivos" }]}
            />
            <div className="w-full lg:max-w-sm">
              <SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar por código" />
            </div>
          </div>
          {hayFiltros && (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <p className="text-[12.5px] text-muted-foreground">Estás viendo una lista filtrada.</p>
              <Button variant="ghost" size="sm" onClick={limpiar} leftIcon={<X aria-hidden="true" />}>Limpiar filtros</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar los cupones</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Cargando cupones">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {datos && lista.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={Ticket}
              titulo={hayFiltros ? "Ningún cupón coincide con el filtro" : "Aún no tienes cupones"}
              descripcion={hayFiltros ? "Prueba con otro texto o quita los filtros." : "Crea tu primer cupón para ofrecer descuentos: un porcentaje, un monto fijo o envío gratis."}
              accion={hayFiltros ? { texto: "Limpiar filtros", onClick: limpiar } : puedeEscribir ? { texto: "Crear cupón", onClick: () => setPanel({ abierto: true, editando: undefined }) } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {datos && lista.length > 0 && (
        <>
          <ul className="grid gap-4 lg:grid-cols-2">
            {lista.map((cupon) => {
              const d = descuento(cupon)
              const v = vigencia(cupon)
              const usos = cupon.cantidad_usos_actual
              const limite = cupon.limite_usos_total
              const porcentajeUso = limite ? Math.min(100, Math.round((usos / limite) * 100)) : 0
              return (
                <li key={cupon.id}>
                  <Card className="h-full flex-row gap-0 overflow-hidden py-0">
                    {/* Talón: el descuento a la vista */}
                    <div className="flex w-32 shrink-0 flex-col items-center justify-center gap-0.5 border-r-2 border-dashed border-primary/40 bg-primary/10 px-3 py-5 text-center sm:w-36">
                      <span className="text-[24px] font-extrabold leading-none tracking-tight text-brand-text">{d.valor}</span>
                      {d.unidad && <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">{d.unidad}</span>}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => copiarCodigo(cupon.codigo)}
                          title="Copiar código"
                          className="group flex min-w-0 cursor-pointer items-center gap-1.5 rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
                        >
                          <span className="truncate font-mono text-[16px] font-extrabold tracking-wide text-foreground">{cupon.codigo}</span>
                          <Copy aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-text" />
                          <span className="sr-only">Copiar código</span>
                        </button>
                        <Badge variant="estado" tono={v.tono}>{v.texto}</Badge>
                      </div>

                      <ul className="space-y-1 text-[12.5px] text-muted-foreground">
                        <li>
                          {cupon.monto_minimo_compra != null && cupon.monto_minimo_compra > 0
                            ? `Compra mínima de ${formatearDinero(cupon.monto_minimo_compra, moneda)}`
                            : "Sin compra mínima"}
                        </li>
                        <li>
                          {cupon.fecha_fin
                            ? `Del ${formatearFecha(cupon.fecha_inicio, zonaHoraria)} al ${formatearFecha(cupon.fecha_fin, zonaHoraria)}`
                            : `Desde el ${formatearFecha(cupon.fecha_inicio, zonaHoraria)}, sin fecha de fin`}
                        </li>
                      </ul>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-muted-foreground">Usos</span>
                          <span className="font-bold text-foreground">{limite != null ? `${usos} de ${limite}` : `${usos} (sin límite)`}</span>
                        </div>
                        {limite != null && (
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${porcentajeUso}%` }} />
                          </div>
                        )}
                      </div>

                      {puedeEscribir && (
                        <div className="mt-auto flex flex-wrap gap-2 pt-1">
                          <Button size="sm" variant="neutral" onClick={() => setPanel({ abierto: true, editando: cupon })} leftIcon={<Pencil aria-hidden="true" />}>
                            Editar
                          </Button>
                          <Button size="sm" variant="danger-outline" onClick={() => eliminar(cupon)} leftIcon={<Trash2 aria-hidden="true" />}>
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </li>
              )
            })}
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
