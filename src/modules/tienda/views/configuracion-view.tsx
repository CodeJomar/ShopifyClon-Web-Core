"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { formatearFecha } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO, ROL } from "@/shared/constants/permisos"
import type { TiendaActivaDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"
import { tiendaActivaAction } from "../actions/tienda.actions"
import { ConfiguracionForm } from "../components/configuracion-form"
import { CambiarEstadoTiendaForm, FORMULARIO_ESTADO_TIENDA } from "../components/cambiar-estado-tienda-form"

export function ConfiguracionView() {
  const { rol, puede } = usePanel()
  const puedeEditar = puede(PERMISO.TIENDA_CONFIGURAR)
  const esPropietario = rol === ROL.PROPIETARIO

  const [tienda, setTienda] = React.useState<TiendaActivaDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [panelEstado, setPanelEstado] = React.useState<{ abierto: boolean; accion: "activar" | "desactivar" }>({
    abierto: false,
    accion: "desactivar",
  })

  const cargar = React.useCallback(async () => {
    const res = await tiendaActivaAction()
    if (res.ok) {
      setError(null)
      setTienda(res.datos)
    } else {
      setError(res.error)
    }
  }, [])

  React.useEffect(() => {
    let cancelado = false
    tiendaActivaAction().then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setTienda(res.datos)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Configuración de la tienda</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Administra la información comercial, monedas, impuestos y estado operativo de tu tienda.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar la configuración</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!tienda && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando configuración de la tienda…
        </p>
      )}

      {tienda && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ConfiguracionForm
              key={`${tienda.id}-${tienda.nombre}-${tienda.tasa_impuesto}`}
              tienda={tienda}
              puedeEditar={puedeEditar}
              onActualizado={cargar}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px]">Estado de la tienda</CardTitle>
                <CardDescription className="text-[13px]">
                  Disponibilidad de la vitrina y suscripción activa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-[13px] font-medium text-foreground">Estado</span>
                  <Badge variant="estado" tono={tienda.esta_activa ? "marca" : "contorno"}>
                    {tienda.esta_activa ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-[13px] font-medium text-foreground">Operativa</span>
                  <Badge variant="estado" tono={tienda.operativa ? "marca" : "aviso"}>
                    {tienda.operativa ? "Operativa" : "No operativa"}
                  </Badge>
                </div>

                <div className="space-y-1 border-b pb-3 text-[12.5px] text-muted-foreground">
                  <p className="font-medium text-foreground">Suscripción</p>
                  <p>Plan: <span className="font-semibold text-foreground">{tienda.suscripcion?.codigo_plan ?? "Sin plan"}</span></p>
                  <p>Estado: {tienda.suscripcion?.estado ?? "Inactivo"}</p>
                  {tienda.suscripcion?.fin_periodo_actual && (
                    <p>
                      Vence: {formatearFecha(tienda.suscripcion.fin_periodo_actual, tienda.zona_horaria)}
                    </p>
                  )}
                </div>

                {esPropietario && (
                  <div className="pt-2">
                    {tienda.esta_activa ? (
                      <Button
                        variant="danger-outline"
                        className="w-full"
                        onClick={() => setPanelEstado({ abierto: true, accion: "desactivar" })}
                      >
                        Desactivar tienda
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setPanelEstado({ abierto: true, accion: "activar" })}
                      >
                        Activar tienda
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <FormPanel
        open={panelEstado.abierto}
        onOpenChange={(abierto) => setPanelEstado((prev) => ({ ...prev, abierto }))}
        title={panelEstado.accion === "desactivar" ? "¿Desactivar tienda?" : "¿Activar tienda?"}
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelEstado((prev) => ({ ...prev, abierto: false }))}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form={FORMULARIO_ESTADO_TIENDA}
              variant={panelEstado.accion === "desactivar" ? "danger" : "default"}
            >
              {panelEstado.accion === "desactivar" ? "Confirmar desactivación" : "Confirmar activación"}
            </Button>
          </>
        }
      >
        <CambiarEstadoTiendaForm
          accion={panelEstado.accion}
          onGuardado={() => {
            setPanelEstado((prev) => ({ ...prev, abierto: false }))
            cargar()
          }}
        />
      </FormPanel>
    </div>
  )
}
