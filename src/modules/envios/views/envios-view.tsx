"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Tarifas de envío</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Configura los métodos y costos de envío que tus clientes podrán elegir durante la compra.
          </p>
        </div>
        {puedeEscribir && (
          <Button onClick={() => setPanel({ abierto: true, editando: undefined })}>Crear tarifa</Button>
        )}
      </div>

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
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando tarifas de envío…
        </p>
      )}

      {tarifas && tarifas.length === 0 && (
        <Card>
          <CardContent className="space-y-4">
            <EstadoVacio
              titulo="Aún no tienes tarifas de envío"
              descripcion="Sin tarifas activas, los productos que requieren envío no se podrán comprar."
              accion={
                puedeEscribir
                  ? { texto: "Crear tarifa", onClick: () => setPanel({ abierto: true, editando: undefined }) }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {tarifas && tarifas.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tarifas.map((tarifa) => (
            <li key={tarifa.id}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-[15px] font-bold text-foreground">{tarifa.nombre}</CardTitle>
                    <Badge variant="estado" tono={tarifa.esta_activa ? "marca" : "contorno"}>
                      {tarifa.esta_activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <CardDescription className="text-[13px] font-semibold text-primary">
                    {tarifa.precio === 0 ? "Gratis" : formatearDinero(tarifa.precio, moneda)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tarifa.descripcion && (
                    <p className="text-[13px] text-muted-foreground">{tarifa.descripcion}</p>
                  )}
                  <div className="space-y-1 text-[12.5px] text-muted-foreground">
                    {tarifa.monto_minimo_gratis != null && tarifa.monto_minimo_gratis > 0 && (
                      <p className="text-brand-text font-medium">
                        Gratis en compras desde {formatearDinero(tarifa.monto_minimo_gratis, moneda)}
                      </p>
                    )}
                    <p>Orden de visualización: {tarifa.orden}</p>
                  </div>

                  {puedeEscribir && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="neutral"
                        onClick={() => setPanel({ abierto: true, editando: tarifa })}
                      >
                        Editar
                      </Button>
                      <Button size="sm" variant="danger-outline" onClick={() => eliminar(tarifa)}>
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
