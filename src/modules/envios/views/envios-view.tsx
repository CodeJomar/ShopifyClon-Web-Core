"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { Pencil, Plus, Trash2, Truck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import type { TarifaEnvioDto } from "@/dtos/envio"
import type { ErrorApi } from "@/lib/api/error-api"
import { tarifasEnvioAction, eliminarTarifaEnvioAction } from "../actions/envios.actions"
import { TarifaEnvioForm, FORMULARIO_TARIFA } from "../components/tarifa-envio-form"

export function EnviosView() {
  const { tienda, puede } = usePanel()
  const puedeEscribir = puede(PERMISO.ENVIOS_CONFIGURAR)
  const moneda = tienda?.moneda ?? "PEN"
  const confirmar = useConfirm()

  const [tarifas, setTarifas] = React.useState<TarifaEnvioDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [panel, setPanel] = React.useState<{ abierto: boolean; editando?: TarifaEnvioDto }>({ abierto: false })

  const cargar = React.useCallback(async () => {
    const res = await tarifasEnvioAction()
    if (res.ok) {
      setError(null)
      // Ordenar por orden ascendente, luego por nombre
      const ordenadas = [...res.datos].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
      setTarifas(ordenadas)
    } else {
      setError(res.error)
    }
  }, [])

  React.useEffect(() => {
    let cancelado = false
    tarifasEnvioAction().then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        const ordenadas = [...res.datos].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
        setTarifas(ordenadas)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelado = true
    }
  }, [])

  const eliminar = async (tarifa: TarifaEnvioDto) => {
    const aceptado = await confirmar({
      variant: "destructive",
      title: "¿Eliminar esta tarifa de envío?",
      description: `Se quitará la tarifa «${tarifa.nombre}». Ya no estará disponible para los compradores.`,
      confirmText: "Sí, eliminar",
    })
    if (!aceptado) return
    const res = await eliminarTarifaEnvioAction(tarifa.id)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: "Tarifa eliminada" })
    cargar()
  }

  const sinActivas = tarifas != null && tarifas.length > 0 && !tarifas.some((t) => t.esta_activa)

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Envíos"
        descripcion="Los métodos y costos de envío que tus clientes pueden elegir al comprar."
        acciones={
          puedeEscribir && (
            <Button onClick={() => setPanel({ abierto: true, editando: undefined })} leftIcon={<Plus aria-hidden="true" />}>
              Crear tarifa
            </Button>
          )
        }
      />

      {sinActivas && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Sin tarifas de envío activas</AlertTitle>
          <AlertDescription>
            Sin tarifas activas, los productos que requieren envío no se podrán comprar en tu tienda (ENV-001).
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar las tarifas de envío</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!tarifas && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Cargando tarifas de envío">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {tarifas && tarifas.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={Truck}
              titulo="Aún no tienes tarifas de envío"
              descripcion="Crea al menos una tarifa activa, por ejemplo «Envío estándar», para que tus clientes puedan comprar productos que se envían."
              accion={puedeEscribir ? { texto: "Crear tarifa", onClick: () => setPanel({ abierto: true, editando: undefined }) } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {tarifas && tarifas.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tarifas.map((tarifa) => (
            <li key={tarifa.id}>
              <Card className={`h-full ${tarifa.esta_activa ? "" : "opacity-80"}`}>
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
                      <Truck className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-extrabold text-foreground">{tarifa.nombre}</p>
                      <p className="text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
                        {tarifa.precio === 0 ? "Gratis" : formatearDinero(tarifa.precio, moneda)}
                      </p>
                    </div>
                    <Badge variant="estado" tono={tarifa.esta_activa ? "marca" : "contorno"}>
                      {tarifa.esta_activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  {tarifa.descripcion && <p className="text-[13px] leading-snug text-muted-foreground">{tarifa.descripcion}</p>}

                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    {tarifa.monto_minimo_gratis != null && tarifa.monto_minimo_gratis > 0 && (
                      <span className="rounded-full bg-primary/14 px-2.5 py-1 font-bold text-brand-text">
                        Gratis desde {formatearDinero(tarifa.monto_minimo_gratis, moneda)}
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-2.5 py-1 font-bold text-muted-foreground">Posición {tarifa.orden}</span>
                  </div>

                  {puedeEscribir && (
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                      <Button size="sm" variant="neutral" onClick={() => setPanel({ abierto: true, editando: tarifa })} leftIcon={<Pencil aria-hidden="true" />}>
                        Editar
                      </Button>
                      <Button size="sm" variant="danger-outline" onClick={() => eliminar(tarifa)} leftIcon={<Trash2 aria-hidden="true" />}>
                        Eliminar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <FormPanel
        open={panel.abierto}
        onOpenChange={(abierto) => setPanel((estadoPrevio) => ({ ...estadoPrevio, abierto }))}
        title={panel.editando ? "Editar tarifa de envío" : "Crear tarifa de envío"}
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setPanel({ abierto: false })}>
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_TARIFA}>
              Guardar
            </Button>
          </>
        }
      >
        <TarifaEnvioForm
          key={panel.editando?.id ?? "nueva"}
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
