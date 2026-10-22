"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CreditCard, Store } from "lucide-react"
import Link from "next/link"
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
    <div className="space-y-5">
      <EncabezadoPagina titulo="Configuración" descripcion="La información de tu tienda, su estado y su suscripción." />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar la configuración</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!tienda && !error && (
        <div className="grid gap-5 lg:grid-cols-3" aria-busy="true" aria-label="Cargando configuración">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      )}

      {tienda && (
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ConfiguracionForm
              key={`${tienda.id}-${tienda.nombre}-${tienda.tasa_impuesto}`}
              tienda={tienda}
              puedeEditar={puedeEditar}
              onActualizado={cargar}
            />
          </div>

          <div className="space-y-5">
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
                    <Store className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold text-foreground">{tienda.nombre}</p>
                    <p className="truncate font-mono text-[12px] text-muted-foreground">otemu.com/tienda/{tienda.subdominio}</p>
                  </div>
                </div>

                <dl className="divide-y divide-border/60 text-[13px]">
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="font-medium text-muted-foreground">Vitrina</dt>
                    <dd>
                      <Badge variant="estado" tono={tienda.esta_activa ? "marca" : "contorno"}>
                        {tienda.esta_activa ? "Visible" : "Oculta"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="font-medium text-muted-foreground">Ventas</dt>
                    <dd>
                      <Badge variant="estado" tono={tienda.operativa ? "marca" : "aviso"}>
                        {tienda.operativa ? "Habilitadas" : "Suscripción inactiva"}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <CreditCard aria-hidden="true" className="size-4 text-brand-text" />
                  Suscripción
                </CardTitle>
                <CardDescription className="text-[12.5px]">El plan que mantiene tu tienda operativa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-[13px]">
                <p className="text-muted-foreground">Plan: <span className="font-bold text-foreground">{tienda.suscripcion?.codigo_plan ?? "Sin plan"}</span></p>
                <p className="text-muted-foreground">Estado: <span className="font-bold text-foreground">{tienda.suscripcion?.estado ?? "Inactivo"}</span></p>
                {tienda.suscripcion?.fin_periodo_actual && (
                  <p className="text-muted-foreground">Vence: <span className="font-bold text-foreground">{formatearFecha(tienda.suscripcion.fin_periodo_actual, tienda.zona_horaria)}</span></p>
                )}
                {puede(PERMISO.SUSCRIPCION_GESTIONAR) && (
                  <Link href="/panel/suscripcion" className="inline-block pt-1 text-[12.5px] font-bold text-brand-text hover:underline">
                    Administrar suscripción →
                  </Link>
                )}
              </CardContent>
            </Card>

            {esPropietario && (
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle className="text-[15px] text-destructive-text">{tienda.esta_activa ? "Zona de riesgo" : "Reactivar tienda"}</CardTitle>
                  <CardDescription className="text-[12.5px]">
                    {tienda.esta_activa
                      ? "Al desactivar tu tienda, la vitrina deja de mostrarse y nadie puede comprar. Podrás activarla de nuevo."
                      : "Tu tienda está desactivada. Actívala para volver a mostrar la vitrina y recibir compras."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tienda.esta_activa ? (
                    <Button variant="danger-outline" className="w-full" onClick={() => setPanelEstado({ abierto: true, accion: "desactivar" })}>
                      Desactivar tienda
                    </Button>
                  ) : (
                    <Button variant="default" className="w-full" onClick={() => setPanelEstado({ abierto: true, accion: "activar" })}>
                      Activar tienda
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
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
